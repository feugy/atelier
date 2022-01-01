const { resolve } = require('path')
const { createReadStream } = require('fs')
const { readdir } = require('fs/promises')
const Ajv = require('ajv')
const sirv = require('sirv')
const { normalizePath } = require('vite')

const pluginName = '@atelier-wb/vite-plugin-svelte'

const validate = new Ajv().compile({
  type: 'object',
  properties: {
    path: { type: 'string' },
    url: { type: 'string', pattern: '^\\/(?:|.+\\/)$' },
    toolRegexp: { type: 'string' },
    workframeHtml: { type: 'string' },
    workframeId: { type: 'string' },
    setupPath: { type: 'string', nullable: true },
    publicDir: {
      oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }]
    }
  },
  required: ['path', 'url', 'toolRegexp', 'workframeHtml', 'workframeId'],
  additionalProperties: true
})

const defaultOptions = {
  path: './atelier',
  url: '/atelier/',
  toolRegexp: '\\.tools(?!\\.shot$).+$',
  workframeHtml: resolve(__dirname, 'workframe.html'),
  workframeId: '@atelier-wb/workframe',
  bundled: true,
  publicDir: []
}

async function findTools(path, detectionRegex) {
  const paths = []
  for (const entry of await readdir(path, {
    withFileTypes: true
  })) {
    const { name } = entry
    const fullname = resolve(path, name)
    if (entry.isFile() && detectionRegex.test(fullname)) {
      paths.push(fullname)
    } else if (entry.isDirectory()) {
      paths.push(...(await findTools(fullname, detectionRegex)))
    }
  }
  return paths
}

function buildWorkframe(paths, { path, setupPath }) {
  const tools = new Array(paths.length)
  const imports = new Array(paths.length)
  let i = 0
  for (const toolPath of paths) {
    imports[i] = `import tool${i + 1} from '${toolPath}'`
    tools[i] = `tool${++i}`
  }
  return `import { Workbench } from '@atelier-wb/svelte'
${
  setupPath
    ? `import '${
        setupPath.startsWith('.') ? resolve(path, setupPath) : setupPath
      }'`
    : ''
}
${imports.join('\n')}

new Workbench({
  target: document.body,
  props: { tools: [${tools.join(', ')}] }
})`
}

function AtelierPlugin(pluginOptions = {}) {
  const options = { ...defaultOptions, ...pluginOptions }
  const valid = validate(options)
  if (!valid) {
    const [error] = validate.errors
    throw new Error(
      `${pluginName} option "${error.instancePath.slice(1)}" ${error.message}`
    )
  }
  const workframeUrl = `${options.url}${options.workframeId}`

  const toolRegexp = new RegExp(options.toolRegexp, 'i')

  return {
    name: pluginName,

    apply: 'serve',

    async configureServer(server) {
      let uiPath = resolve(__dirname, '..', '..', 'ui')
      if (options.bundled) {
        uiPath = resolve(uiPath, 'dist')
      }
      const statics = [
        uiPath,
        ...(Array.isArray(options.publicDir)
          ? options.publicDir
          : [options.publicDir]
        ).filter(Boolean)
      ]
      const serves = statics.map(dir => sirv(dir, { etag: true }))

      // configure a middleware for serving Atelier
      server.middlewares.use(options.url, (req, res, next) => {
        if (req.url === `/workframe.html`) {
          // serve our workframe.html for the iframe
          res.writeHead(200, {
            'Cache-Control': 'no-store',
            'Content-Type': 'text/html'
          })
          createReadStream(options.workframeHtml).pipe(res)
        } else if (`${req.originalUrl}/` === options.url) {
          // append trailing slash to allows resolving <script /> with relative sources
          res.statusCode = 301
          res.setHeader('Location', options.url)
          res.end()
        } else {
          // all other static Atelier assets
          let i = 0
          const tryNext = () => {
            if (serves[i]) {
              serves[i++](req, res, tryNext)
            } else {
              next()
            }
          }
          tryNext()
        }
      })

      async function reloadTools(path, stats) {
        if (toolRegexp.test(normalizePath(path)) || stats?.isDirectory()) {
          server.watcher.emit('change', workframeUrl)
        }
      }

      server.watcher.on('add', reloadTools)
      server.watcher.on('addDir', reloadTools)
      server.watcher.on('unlink', reloadTools)
      server.watcher.on('unlinkDir', reloadTools)
    },

    resolveId(id) {
      if (id === workframeUrl) {
        return id
      }
    },

    async load(id) {
      if (id === workframeUrl) {
        const workframe = buildWorkframe(
          await findTools(options.path, toolRegexp),
          options
        )
        return workframe
      }
    }
  }
}

module.exports = AtelierPlugin
AtelierPlugin.pluginName = pluginName
AtelierPlugin['default'] = AtelierPlugin
