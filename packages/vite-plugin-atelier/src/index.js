import Ajv from 'ajv'
import { createReadStream } from 'fs'
import { cp, readdir, readFile, rm, stat, writeFile } from 'fs/promises'
import { createRequire } from 'module'
import { dirname, resolve } from 'path'
import sirv from 'sirv'
import { fileURLToPath } from 'url'
import { normalizePath, searchForWorkspaceRoot } from 'vite'

const ui = dirname(createRequire(import.meta.url).resolve('@atelier-wb/ui'))
const pluginName = '@atelier-wb/vite-plugin-atelier'
const exportMode = 'export-atelier'

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
    outDir: { type: 'string' }
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
  workframeHtml: resolve(
    dirname(fileURLToPath(import.meta.url)),
    'workframe.html'
  ),
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
      paths.push(fullname.replace(/\\/g, '/'))
    } else if (entry.isDirectory()) {
      paths.push(...(await findTools(fullname, detectionRegex)))
    }
  }
  return paths
}

async function buildDevWorkframe(paths, { framework, path, setupPath }) {
  let bindings
  try {
    bindings = await import(`@atelier-wb/${framework}/workframe-content.js`)
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
      `import '${(setupPath.startsWith('.')
        ? resolve(path, setupPath)
        : setupPath
      ).replace(/\\/g, '/')}'`
    )
  }
  return await bindings.buildWorkframeContent({ tools, imports })
}

async function buildStaticWorkframe(filePath, options) {
  const content = await readFile(options.workframeHtml, 'utf8')
  const toolsContent = await buildDevWorkframe(
    await findTools(options.path, new RegExp(options.toolRegexp, 'i')),
    options
  )
  await writeFile(
    filePath,
    content
      .replace(/<script.*src="\/@vite\/client"(?!<\/script>)><\/script>/i, '')
      .replace(
        new RegExp(`<script.*src="${options.workframeId}"></script>`, 'i'),
        `<script type="module">\n${toolsContent}\n</script>`
      )
  )
}

function buildSettings(options) {
  return `window.uiSettings = ${JSON.stringify(options.uiSettings)};`
}

export default function AtelierPlugin(
  pluginOptions = {},
  skipValidation = false
) {
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
  const workframeFile = 'workframe.html'

  let isExporting = false
  let root
  let outDir
  let entryFile

  return {
    name: pluginName,

    // Atelier has to come after sveltekit to remove SSR from build configuration
    enforce: 'post',

    async config(configuration, { command, mode }) {
      isExporting = command === 'build' && mode === exportMode

      options.path = resolve(configuration.root ?? '.', options.path)
      return {
        // when building for Atelier export, we need to undo Sveltekit customizations
        ...(isExporting ? { build: { ssr: false, copyPublicDir: true } } : {}),
        server: {
          fs: {
            allow: [
              ...new Set([
                ...(configuration.server?.fs?.allow ?? [
                  searchForWorkspaceRoot(process.cwd())
                ]),
                options.path,
                ...statics
              ])
            ]
          }
        }
      }
    },

    async configResolved(viteConfig) {
      if (isExporting) {
        root = viteConfig.root
        outDir = normalizePath(`${root}/${options.outDir}`)
        entryFile = normalizePath(`${root}/${workframeFile}`)
        await buildStaticWorkframe(entryFile, options)
        viteConfig.build.rollupOptions = { input: entryFile }
        viteConfig.build.outDir = outDir
        // exclude sveltekit plugin to avoid:
        // Error: ENOENT: no such file or directory, open '.svelte-kit/output/server/vite-manifest.json'
        viteConfig.plugins = viteConfig.plugins.filter(
          ({ name }) =>
            !name.includes('vite-plugin-sveltekit-compile') &&
            !name.includes('vite-plugin-svelte-kit')
        )
      }
    },

    async configureServer(server) {
      const serves = statics.map(dir => sirv(dir, { etag: true }))

      // configure a middleware for serving Atelier
      server.middlewares.use(options.url, (request, response, next) => {
        if (request.url === `/${workframeFile}`) {
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
      if (id === workframeUrl) {
        return id
      }
    },

    async load(id) {
      if (id === workframeUrl) {
        return await buildDevWorkframe(
          await findTools(options.path, toolRegexp),
          options
        )
      }
    },

    async closeBundle() {
      if (isExporting) {
        await writeFile(resolve(outDir, settingsFile), buildSettings(options))
        for (const staticFolder of statics.slice(1)) {
          if (await stat(resolve(root, staticFolder)).catch(() => false)) {
            await cp(resolve(root, staticFolder), outDir, {
              force: true,
              recursive: true
            })
          }
        }
        await cp(uiDist, outDir, { recursive: true })
        await rm(entryFile, { force: true })
      }
    }
  }
}

AtelierPlugin.pluginName = pluginName
