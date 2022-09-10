const Ajv = require('ajv')
const { createReadStream } = require('fs')
const { cp, readdir, readFile, writeFile, rm, stat } = require('fs/promises')
const { basename, dirname, resolve, join } = require('path')
const colors = require('picocolors')
const sirv = require('sirv')
const { normalizePath, createLogger } = require('vite')
const ui = dirname(require.resolve('@atelier-wb/ui'))

const pluginName = '@atelier-wb/vite-plugin-atelier'

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
    },
    framework: { type: 'string', enum: ['svelte'] },
    uiSettings: { type: 'object', additionalProperties: true },
    outDir: { type: 'string', nullable: true }
  },
  required: [
    'path',
    'url',
    'toolRegexp',
    'workframeHtml',
    'workframeId',
    'framework',
    'outDir'
  ],
  additionalProperties: true
})

const defaultOptions = {
  path: './atelier',
  url: '/atelier/',
  toolRegexp: '\\.tools(?!\\.shot$).+$',
  workframeHtml: resolve(__dirname, 'workframe.html'),
  workframeId: '@atelier-wb/workframe',
  bundled: true,
  publicDir: [],
  framework: 'svelte',
  uiSettings: {},
  outDir: 'dist-atelier'
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

async function buildDevWorkframe(paths, { framework, path, setupPath }) {
  let bindings
  try {
    bindings = require(`@atelier-wb/${framework}/workframe-content.cjs`)
  } catch (err) {
    throw new Error(
      `Could not load framework bindings for ${framework}. Please add to your dependencies: npm i -D @atelier-wb/${framework}`
    )
  }
  const tools = new Array(paths.length)
  const imports = new Array(paths.length)
  let i = 0
  for (const toolPath of paths) {
    imports[i] = `import tool${i + 1} from '${toolPath}'`
    tools[i] = `tool${++i}`
  }
  if (setupPath) {
    imports.unshift(
      `import '${
        setupPath.startsWith('.') ? resolve(path, setupPath) : setupPath
      }'`
    )
  }
  return await bindings.buildWorkframeContent({ tools, imports })
}

async function buildWorkframe(path) {
  const content = await readFile(path, 'utf8')
  return content.replace(
    /<script.*src="\/@vite\/client"(?!<\/script>)><\/script>/i,
    ''
  )
}

function buildSettings(options) {
  return `window.uiSettings = ${JSON.stringify(options.uiSettings)};`
}

function AtelierPlugin(pluginOptions = {}, skipValidation = false) {
  const options = { ...defaultOptions, ...pluginOptions }
  const valid = validate(options)
  if (!valid && !skipValidation) {
    const [error] = validate.errors
    throw new Error(
      `${pluginName} option "${error.instancePath.slice(1)}" ${error.message}`
    )
  }
  const workframeUrl = `${options.url}${options.workframeId}`

  const toolRegexp = new RegExp(options.toolRegexp, 'i')
  const uiDist = resolve(ui, 'dist')
  const uiPath = options.bundled ? uiDist : ui
  const statics = [
    uiPath,
    ...(Array.isArray(options.publicDir)
      ? options.publicDir
      : [options.publicDir])
  ].filter(Boolean)
  const settingsFile = 'ui-settings.js'
  const workfromeFile = 'workframe.html'
  // because vite can not write outside of its outDir, uses a temporary folder
  const buildTempFolder = 'atelier-tmp'

  let isBuilding = false
  let logger
  let root
  let isWorkframeId
  let staticWorkframeId
  let viteOutDir

  return {
    name: pluginName,

    async config(configuration, { command }) {
      isBuilding = command === 'build' && !!options.outDir
      root = configuration.root ?? '.'
      options.path = resolve(root, options.path)
      if (options.outDir) {
        options.outDir = resolve(root, options.outDir)
      }
      logger = createLogger(configuration.logLevel)
      isWorkframeId = isBuilding
        ? id => id === options.workframeId
        : id => id === workframeUrl
      return {
        server: { fs: { allow: [...new Set([options.path, ...statics])] } }
      }
    },

    async configureServer(server) {
      const serves = statics.map(dir => sirv(dir, { etag: true }))

      // configure a middleware for serving Atelier
      server.middlewares.use(options.url, (request, response, next) => {
        if (request.url === `/${workfromeFile}`) {
          // serve our workframe.html for the iframe
          response.writeHead(200, {
            'Cache-Control': 'no-store',
            'Content-Type': 'text/html'
          })
          createReadStream(options.workframeHtml).pipe(response)
        } else if (request.url === `/${settingsFile}`) {
          response.writeHead(200, {
            'Cache-Control': 'no-store',
            'Content-Type': 'application/javascript;charset=utf-8'
          })
          response.end(buildSettings(options))
        } else if (`${request.originalUrl}/` === options.url) {
          // append trailing slash to allows resolving <script /> with relative sources
          response.statusCode = 301
          response.setHeader('Location', options.url)
          response.end()
        } else {
          // all other static Atelier assets
          let i = 0
          const tryNext = () => {
            if (serves[i]) {
              serves[i++](request, response, tryNext)
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
      if (id === staticWorkframeId || isWorkframeId(id)) {
        return id
      }
    },

    async load(id) {
      if (id === staticWorkframeId) {
        return await buildWorkframe(options.workframeHtml)
      } else if (isWorkframeId(id)) {
        return await buildDevWorkframe(
          await findTools(options.path, toolRegexp),
          options
        )
      }
    },

    async options(buildOpts) {
      if (!isBuilding) {
        return buildOpts
      }
      staticWorkframeId = resolve(root, buildTempFolder, workfromeFile)
      // do not include vite default index.html if it does not exist
      const inputExist = await stat(buildOpts.input).catch(() => false)
      buildOpts.input = inputExist
        ? [buildOpts.input, staticWorkframeId]
        : [staticWorkframeId]
      return buildOpts
    },

    outputOptions(outputOpts) {
      viteOutDir = outputOpts.dir
      return null
    },

    async generateBundle(generateOpts, bundle) {
      if (options.outDir) {
        await rm(options.outDir, { recursive: true, force: true })
      }
      // moves workframe assets into the temporary folder
      for (const entry of Object.values(bundle)) {
        if (
          entry.facadeModuleId === staticWorkframeId ||
          entry.name?.includes(buildTempFolder)
        ) {
          entry.fileName = join(buildTempFolder, entry.fileName)
        }
      }
      // generates ui-settings file
      this.emitFile({
        type: 'asset',
        fileName: join(buildTempFolder, settingsFile),
        source: buildSettings(options)
      })
    },

    async writeBundle(writeOpts, bundle) {
      const entry = bundle[join(buildTempFolder, workfromeFile)]
      if (entry) {
        // makes workframe assets paths relative
        await writeFile(
          join(viteOutDir, buildTempFolder, basename(entry.fileName)),
          entry.source.replace(/"[^"]+(\/workframe\..+)"/g, `"./assets$1"`)
        )
      }
    },

    async closeBundle() {
      if (isBuilding) {
        const fullBuildTempFolder = join(viteOutDir, buildTempFolder)
        // includes static assets and ui distribution
        for (const staticFolder of statics) {
          await cp(resolve(root, staticFolder), options.outDir, {
            force: true,
            recursive: true
          })
        }
        // moves temporary folder to its final place
        await cp(fullBuildTempFolder, options.outDir, { recursive: true })
        await rm(fullBuildTempFolder, { recursive: true })
        logger.info(
          `${colors.green('atelier')} static build available in ${colors.gray(
            resolve(options.outDir)
          )}`
        )
      }
    }
  }
}

module.exports = AtelierPlugin
AtelierPlugin.pluginName = pluginName
AtelierPlugin['default'] = AtelierPlugin
