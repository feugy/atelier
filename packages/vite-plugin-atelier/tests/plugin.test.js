import { faker } from '@faker-js/faker'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import connect from 'connect'
import { EventEmitter } from 'events'
import { readFile, rm, stat } from 'fs/promises'
import { createServer } from 'http'
import { dirname, resolve } from 'path'
import { fetch } from 'undici'
import { fileURLToPath } from 'url'
import { build } from 'vite'
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi
} from 'vitest'

import builder from '../src'

const defaultWorkframeId = '@atelier-wb/workframe'
const defaultUrl = '/atelier/'
const __dirname = dirname(fileURLToPath(import.meta.url))
const path = resolve(__dirname, 'fixtures', 'nested').replace(/\\/g, '/')

async function configureAndStartServer(options) {
  const plugin = builder(options)
  const middlewares = connect()
  const server = createServer(middlewares)
  const watcher = new EventEmitter()
  await plugin.configureServer({ middlewares, watcher })
  await new Promise((resolve, reject) =>
    server.listen(err => (err ? reject(err) : resolve()))
  )
  return {
    server,
    watcher,
    address: `http://localhost:${server.address().port}`
  }
}

async function preparePlugin(
  options = {},
  viteEnv = { command: 'serve' },
  skipValidation = false
) {
  const plugin = builder(options, skipValidation)
  await plugin.config({ root: '' }, viteEnv)
  return plugin
}

describe('plugin builder', () => {
  beforeEach(() => vi.resetAllMocks())

  it('validates path option', () => {
    expect(() => builder({ path: true })).toThrow(
      `${builder.pluginName} option "path" must be string`
    )
  })

  it('validates url option', () => {
    expect(() => builder({ url: null })).toThrow(
      `${builder.pluginName} option "url" must be string`
    )
    expect(() => builder({ url: '/foo' })).toThrow(
      `${builder.pluginName} option "url" must match pattern "^\\/(?:|.+\\/)$"`
    )
    expect(() => builder({ url: 'bar/' })).toThrow(
      `${builder.pluginName} option "url" must match pattern "^\\/(?:|.+\\/)$"`
    )
    expect(() => builder({ url: '/' })).not.toThrow()
    expect(() => builder({ url: '/foo/' })).not.toThrow()
    expect(() => builder({ url: '/foo/bar/' })).not.toThrow()
  })

  it('validates toolRegexp option', () => {
    expect(() => builder({ toolRegexp: [] })).toThrow(
      `${builder.pluginName} option "toolRegexp" must be string`
    )
    const toolRegexp = '(unparseable regexp'
    expect(() => builder({ toolRegexp })).toThrow(
      `Invalid regular expression: /${toolRegexp}/`
    )
  })

  it('validates workframeHtml option', () => {
    expect(() => builder({ workframeHtml: 10 })).toThrow(
      `${builder.pluginName} option "workframeHtml" must be string`
    )
  })

  it('validates workframeId option', () => {
    expect(() => builder({ workframeId: {} })).toThrow(
      `${builder.pluginName} option "workframeId" must be string`
    )
  })

  it('validates setupPath option', () => {
    expect(() => builder({ setupPath: new Map() })).toThrow(
      `${builder.pluginName} option "setupPath" must be string`
    )
  })

  it('validates publicDir option', () => {
    expect(() => builder({ publicDir: null })).toThrow(
      `${builder.pluginName} option "publicDir" must be string`
    )
    expect(() => builder({ publicDir: 15 })).toThrow(
      `${builder.pluginName} option "publicDir" must be string`
    )
    expect(() => builder({ publicDir: [{}] })).toThrow(
      `${builder.pluginName} option "publicDir" must be string`
    )
  })

  it('validates framework option', () => {
    expect(() => builder({ framework: 'jquery' })).toThrow(
      `${builder.pluginName} option "framework" must be equal to one of the allowed values`
    )
    expect(() => builder({ framework: 15 })).toThrow(
      `${builder.pluginName} option "framework" must be string`
    )
    expect(() => builder({ framework: [{}] })).toThrow(
      `${builder.pluginName} option "framework" must be string`
    )
  })

  it('validates uiSettings option', () => {
    expect(() => builder({ uiSettings: 'jquery' })).toThrow(
      `${builder.pluginName} option "uiSettings" must be object`
    )
    expect(() => builder({ uiSettings: null })).toThrow(
      `${builder.pluginName} option "uiSettings" must be object`
    )
  })

  it('validates outDir option', () => {
    expect(() => builder({ outDir: false })).toThrow(
      `${builder.pluginName} option "outDir" must be string`
    )
    expect(() => builder({ outDir: undefined })).toThrow(
      `${builder.pluginName} option "" must have required property 'outDir'`
    )
  })

  describe('given some files', () => {
    it('does not handle other ids than workframeId', async () => {
      const plugin = await preparePlugin()
      expect(plugin.resolveId(faker.lorem.word())).toBeUndefined()
      expect(await plugin.load(faker.lorem.word())).toBeUndefined()
      expect(plugin.resolveId(`${defaultUrl}${defaultWorkframeId}`)).toBe(
        `${defaultUrl}${defaultWorkframeId}`
      )
    })

    it('supports custom workframeId', async () => {
      const workframeId = faker.lorem.word()
      const plugin = await preparePlugin({ workframeId })
      expect(plugin.resolveId(faker.lorem.word())).toBeUndefined()
      expect(await plugin.load(faker.lorem.word())).toBeUndefined()
      expect(plugin.resolveId(`${defaultUrl}${workframeId}`)).toBe(
        `${defaultUrl}${workframeId}`
      )
    })

    it('throws on unavailbable framework bindings', async () => {
      const framework = 'jquery'
      const plugin = await preparePlugin({ path, framework }, undefined, true)
      await expect(
        plugin.load(`${defaultUrl}${defaultWorkframeId}`)
      ).rejects.toThrow(
        `Could not load framework bindings for ${framework}. Please add to your dependencies: npm i -D @atelier-wb/${framework}`
      )
    })

    it('finds tool files and generates workframe content', async () => {
      const plugin = await preparePlugin({ path })
      expect(await plugin.load(`${defaultUrl}${defaultWorkframeId}`))
        .toBe(`import { Workbench } from '@atelier-wb/svelte'

import tool1 from '${path}/a.tools.svelte'
import tool2 from '${path}/b.tools.svelte'
import tool3 from '${path}/folder1/b.tools.svelte'
import tool4 from '${path}/folder1/d.tools.svelte'
import tool5 from '${path}/folder1/folder1/b.tools.svelte'
import tool6 from '${path}/folder2/c.tools.svelte'
import tool7 from '${path}/folder2/folder1/a.tools.svelte'

new Workbench({
  target: document.body,
  props: { tools: [tool1, tool2, tool3, tool4, tool5, tool6, tool7] }
})`)
    })

    it('finds tool files with custom regexp', async () => {
      const path = resolve(__dirname, 'fixtures', 'nested').replace(/\\/g, '/')
      const plugin = await preparePlugin({
        path,
        toolRegexp: '\\.custom\\.svelte$'
      })
      expect(await plugin.load(`${defaultUrl}${defaultWorkframeId}`))
        .toBe(`import { Workbench } from '@atelier-wb/svelte'

import tool1 from '${path}/c.custom.svelte'
import tool2 from '${path}/folder1/a.custom.svelte'
import tool3 from '${path}/folder1/folder1/c.custom.svelte'
import tool4 from '${path}/folder2/b.custom.svelte'
import tool5 from '${path}/folder2/folder2/a.custom.svelte'

new Workbench({
  target: document.body,
  props: { tools: [tool1, tool2, tool3, tool4, tool5] }
})`)
    })

    it('allows setup import from node_modules', async () => {
      const setupPath = faker.lorem.word()
      const plugin = await preparePlugin({ path, setupPath })
      expect(await plugin.load(`${defaultUrl}${defaultWorkframeId}`))
        .toBe(`import { Workbench } from '@atelier-wb/svelte'

import '${setupPath}'
import tool1 from '${path}/a.tools.svelte'
import tool2 from '${path}/b.tools.svelte'
import tool3 from '${path}/folder1/b.tools.svelte'
import tool4 from '${path}/folder1/d.tools.svelte'
import tool5 from '${path}/folder1/folder1/b.tools.svelte'
import tool6 from '${path}/folder2/c.tools.svelte'
import tool7 from '${path}/folder2/folder1/a.tools.svelte'

new Workbench({
  target: document.body,
  props: { tools: [tool1, tool2, tool3, tool4, tool5, tool6, tool7] }
})`)
    })

    it('allows relative setup import', async () => {
      const setupPath = faker.lorem.word()
      const plugin = await preparePlugin({ path, setupPath: `./${setupPath}` })
      expect(await plugin.load(`${defaultUrl}${defaultWorkframeId}`))
        .toBe(`import { Workbench } from '@atelier-wb/svelte'

import '${resolve(path, setupPath).replace(/\\/g, '/')}'
import tool1 from '${path}/a.tools.svelte'
import tool2 from '${path}/b.tools.svelte'
import tool3 from '${path}/folder1/b.tools.svelte'
import tool4 from '${path}/folder1/d.tools.svelte'
import tool5 from '${path}/folder1/folder1/b.tools.svelte'
import tool6 from '${path}/folder2/c.tools.svelte'
import tool7 from '${path}/folder2/folder1/a.tools.svelte'

new Workbench({
  target: document.body,
  props: { tools: [tool1, tool2, tool3, tool4, tool5, tool6, tool7] }
})`)
    })

    it('allows absolute setup import', async () => {
      const setupPath = resolve(path, faker.lorem.word()).replace(/\\/g, '/')
      const plugin = await preparePlugin({ path, setupPath })
      expect(await plugin.load(`${defaultUrl}${defaultWorkframeId}`))
        .toBe(`import { Workbench } from '@atelier-wb/svelte'

import '${setupPath}'
import tool1 from '${path}/a.tools.svelte'
import tool2 from '${path}/b.tools.svelte'
import tool3 from '${path}/folder1/b.tools.svelte'
import tool4 from '${path}/folder1/d.tools.svelte'
import tool5 from '${path}/folder1/folder1/b.tools.svelte'
import tool6 from '${path}/folder2/c.tools.svelte'
import tool7 from '${path}/folder2/folder1/a.tools.svelte'

new Workbench({
  target: document.body,
  props: { tools: [tool1, tool2, tool3, tool4, tool5, tool6, tool7] }
})`)
    })

    it('adds atelier paths to default project', async () => {
      const plugin = builder({})
      expect(
        (await plugin.config({ root: '' }, { command: 'serve' }))?.server?.fs
          ?.allow
      ).toEqual([
        resolve(__dirname, '../../..'),
        resolve(__dirname, '../atelier'),
        resolve(__dirname, '../../ui/dist')
      ])
    })

    it('adds atelier paths to the provided ones', async () => {
      const allow = [faker.system.directoryPath(), faker.system.directoryPath()]
      const plugin = builder({})
      expect(
        (
          await plugin.config(
            { root: '', server: { fs: { allow } } },
            { command: 'serve' }
          )
        )?.server?.fs?.allow
      ).toEqual([
        ...allow,
        resolve(__dirname, '../atelier'),
        resolve(__dirname, '../../ui/dist')
      ])
    })
  })

  describe('given a started server', () => {
    let server

    afterEach(() => server?.close())

    it(`serves script with ui settings`, async () => {
      let address
      const url = '/atelier/'
      const uiSettings = {
        backgrounds: ['', 'blue', 'pink'],
        sizes: [{ width: 480, height: 800 }]
      }
      ;({ server, address } = await configureAndStartServer({
        url,
        path,
        uiSettings
      }))

      const response = await fetch(`${address}${url}ui-settings.js`)
      expect(response.status).toBe(200)
      expect(response.headers.get('content-type')).toBe(
        'application/javascript;charset=utf-8'
      )
      expect(await response.text()).toBe(
        `window.uiSettings = ${JSON.stringify(uiSettings)};`
      )
    })
  })

  describe('given a configured and started server', () => {
    let server
    let address
    let watcher
    let url = '/atelier/'

    beforeEach(async () => {
      ;({ server, watcher, address } = await configureAndStartServer({
        url,
        path,
        publicDir: [
          resolve(__dirname, 'fixtures', 'static1'),
          resolve(__dirname, 'fixtures', 'static2')
        ]
      }))
    })

    afterEach(() => server.close())

    it(`serves atelier's main html file`, async () => {
      const response = await fetch(`${address}${url}`)
      expect(response.status).toBe(200)
      expect(response.headers.get('content-type')).toBe(
        'text/html;charset=utf-8'
      )
      const body = await response.text()
      expect(body).toEqual(
        expect.stringContaining(
          '<script type="module" crossorigin src="./assets/index-'
        )
      )
      expect(body).toEqual(
        expect.stringContaining(
          '<link rel="stylesheet" crossorigin href="./assets/index-'
        )
      )
    })

    it(`serves script with empty ui settings`, async () => {
      const response = await fetch(`${address}${url}ui-settings.js`)
      expect(response.status).toBe(200)
      expect(response.headers.get('content-type')).toBe(
        'application/javascript;charset=utf-8'
      )
      expect(await response.text()).toBe('window.uiSettings = {};')
    })

    it(`serves files from public dir`, async () => {
      let response = await fetch(`${address}${url}icon-256x256.png`)
      expect(response.status).toBe(200)
      expect(response.headers.get('content-type')).toBe('image/png')
      response = await fetch(`${address}${url}favicon.ico`)
      expect(response.status).toBe(200)
      expect(response.headers.get('content-length')).toBe('1150')
      response = await fetch(`${address}${url}unknown.jpeg`)
      expect(response.status).toBe(404)
    })

    it(`redirects to atelier's main html file without trailing /`, async () => {
      const response = await fetch(`${address}${url.slice(0, -1)}`, {
        redirect: 'manual'
      })
      expect(response.status).toBe(301)
      expect(response.headers.get('location')).toEqual(url)
    })

    it(`serves atelier's workframe`, async () => {
      const response = await fetch(`${address}${url}workframe.html`)
      expect(response.status).toBe(200)
      expect(response.headers.get('content-type')).toBe('text/html')
      expect(await response.text()).toMatchInlineSnapshot(`
        "<!DOCTYPE html>
        <html lang=\\"en\\">

        <head>
          <meta charset=\\"utf-8\\" />
          <meta name=\\"viewport\\" content=\\"width=device-width, initial-scale=1\\" />
          <script type=\\"module\\" src=\\"/@vite/client\\"></script>
        </head>

        <body>
          <script type=\\"module\\" src=\\"@atelier-wb/workframe\\"></script>
        </body>

        </html>"
      `)
    })

    it.each([
      ['tool file creation', 'add', 'test-added.tools.svelte', false],
      ['folder creation', 'addDir', faker.system.fileName(), true],
      ['tool file removal', 'unlink', 'test-removed.tools.svelte', false],
      ['folder removal', 'unlinkDir', faker.system.fileName(), true]
    ])(
      'triggers workframe on %s',
      async (test, eventName, file, isDirectory) => {
        const emit = vi.spyOn(watcher, 'emit')
        expect(emit).not.toHaveBeenCalled()

        watcher.emit(eventName, resolve(path, file), {
          isDirectory: () => isDirectory
        })
        expect(emit).toHaveBeenCalledWith(
          'change',
          `${url}${defaultWorkframeId}`
        )
        expect(emit).toHaveBeenCalledTimes(2)
      }
    )

    it.each([
      ['regular file creation', 'add', faker.system.fileName()],
      ['regular file removal', 'unlink', faker.system.fileName()]
    ])('does not trigger workframe on %s', async (test, eventName, file) => {
      const emit = vi.spyOn(watcher, 'emit')
      expect(emit).not.toHaveBeenCalled()

      watcher.emit(eventName, resolve(path, file), { isDirectory: () => false })
      expect(emit).not.toHaveBeenCalledWith(
        'change',
        `${url}/${defaultWorkframeId}`
      )
      expect(emit).toHaveBeenCalledTimes(1)
    })
  })

  it(`does not export when building without 'export-atelier' mode`, async () => {
    const root = resolve(__dirname, 'fixtures/simple')
    const atelierOut = resolve(root, 'dist-atelier')
    await rm(atelierOut, { recursive: true, force: true })
    await build({
      root,
      logLevel: 'silent',
      plugins: [svelte(), builder()]
    })
    await expect(stat(atelierOut)).rejects.toThrow('ENOENT')
  })

  describe('given a built simple application', () => {
    const root = resolve(__dirname, 'fixtures/simple')
    const atelierOut = resolve(root, 'dist-atelier')
    const uiSettings = { foo: faker.lorem.words() }

    beforeAll(async () => {
      await rm(atelierOut, { recursive: true, force: true })
      await build({
        root,
        mode: 'export-atelier',
        logLevel: 'silent',
        plugins: [svelte(), builder({ uiSettings })]
      })
    })

    // eslint-disable-next-line vitest/expect-expect -- expectWorkframeAndAssets contains expectations
    it(`generated workframe file with its assets`, async () => {
      await expectWorkframeAndAssets(atelierOut)
    })

    // eslint-disable-next-line vitest/expect-expect -- expectWorkframeAndAssets contains expectations
    it(`included ui distribution`, async () => {
      await expectUiDistribution(atelierOut)
    })

    it(`generated ui-settings file`, async () => {
      const settingsPath = resolve(atelierOut, 'ui-settings.js')
      await expect(stat(settingsPath)).resolves.toBeDefined()
      expect(await readFile(settingsPath, 'utf-8')).toBe(
        `window.uiSettings = ${JSON.stringify(uiSettings)};`
      )
    })
  })

  describe('given a built simple application with custom out', () => {
    const root = resolve(__dirname, 'fixtures/simple')
    const atelierOut = resolve(root, 'dist-atelier/custom-out')

    beforeAll(async () => {
      await rm(atelierOut, { recursive: true, force: true })
      await build({
        root,
        mode: 'export-atelier',
        logLevel: 'silent',
        plugins: [svelte(), builder({ outDir: 'dist-atelier/custom-out' })]
      })
    })

    // eslint-disable-next-line vitest/expect-expect -- expectWorkframeAndAssets contains expectations
    it(`generated workframe file with its assets`, async () => {
      await expectWorkframeAndAssets(atelierOut)
    })

    // eslint-disable-next-line vitest/expect-expect -- expectWorkframeAndAssets contains expectations
    it(`included ui distribution`, async () => {
      await expectUiDistribution(atelierOut)
    })
  })

  describe('given a built application with custom path', () => {
    const root = resolve(__dirname, 'fixtures/custom-path')
    const atelierOut = resolve(root, 'dist-atelier')

    beforeAll(async () => {
      await rm(atelierOut, { recursive: true, force: true })
      await build({
        root,
        mode: 'export-atelier',
        logLevel: 'silent',
        plugins: [svelte(), builder({ path })]
      })
    })

    // eslint-disable-next-line vitest/expect-expect -- expectWorkframeAndAssets contains expectations
    it(`generated workframe file with its assets`, async () => {
      await expectWorkframeAndAssets(atelierOut)
    })

    // eslint-disable-next-line vitest/expect-expect -- expectWorkframeAndAssets contains expectations
    it(`included ui distribution`, async () => {
      await expectUiDistribution(atelierOut)
    })
  })

  describe('given a built application with public directories', () => {
    const root = resolve(__dirname, 'fixtures/public-dirs')
    const atelierOut = resolve(root, 'dist-atelier')

    beforeAll(async () => {
      await rm(atelierOut, { recursive: true, force: true })
      await build({
        root,
        mode: 'export-atelier',
        logLevel: 'silent',
        plugins: [svelte(), builder({ publicDir: ['./static'] })]
      })
    })

    // eslint-disable-next-line vitest/expect-expect -- expectWorkframeAndAssets contains expectations
    it(`generated workframe file with its assets`, async () => {
      await expectWorkframeAndAssets(atelierOut)
    })

    // eslint-disable-next-line vitest/expect-expect -- expectWorkframeAndAssets contains expectations
    it(`included ui distribution`, async () => {
      await expectUiDistribution(atelierOut)
    })

    it(`copied vite default public assets`, async () => {
      await expect(
        stat(resolve(atelierOut, 'favicon.ico'))
      ).resolves.toBeDefined()
    })

    it(`copied public directory assets`, async () => {
      await expect(
        stat(resolve(atelierOut, 'icon-256x256.png'))
      ).resolves.toBeDefined()
    })
  })

  describe('given a built sveltekit application', () => {
    const root = resolve(__dirname, 'fixtures/simple')
    const atelierOut = resolve(root, 'dist-atelier')
    const uiSettings = { foo: faker.lorem.words() }
    const sveltekitBuild = vi.fn()

    beforeEach(async () => {
      await rm(atelierOut, { recursive: true, force: true })
    })

    it(`excluded svelte-kit legacy plugin`, async () => {
      await build({
        root,
        mode: 'export-atelier',
        logLevel: 'silent',
        plugins: [
          svelte(),
          builder({ uiSettings }),
          { name: 'vite-plugin-svelte-kit', closeBundle: sveltekitBuild }
        ]
      })
      expect(sveltekitBuild).not.toHaveBeenCalled()
    })

    it(`excluded svelte-kit 1.0 plugin`, async () => {
      await build({
        root,
        mode: 'export-atelier',
        logLevel: 'silent',
        plugins: [
          svelte(),
          builder({ uiSettings }),
          { name: 'vite-plugin-sveltekit-compile', closeBundle: sveltekitBuild }
        ]
      })
      expect(sveltekitBuild).not.toHaveBeenCalled()
    })
  })
})

async function expectWorkframeAndAssets(atelierOut) {
  const workframeHtmlPath = resolve(atelierOut, 'workframe.html')
  const workframeJsRegExp =
    /<script type="module" crossorigin src="\/(.+\/workframe-.+\.js)">/
  const workframeCssRegExp =
    /<link rel="stylesheet" crossorigin href="\/(.+\/workframe-.+\.css)">/

  await expect(stat(workframeHtmlPath)).resolves.toBeDefined()
  const content = await readFile(workframeHtmlPath, 'utf-8')
  expect(
    content,
    `${content} does not include expected path to JS bundle`
  ).toMatch(workframeJsRegExp)
  expect(
    content,
    `${content} does not include expected path to Css bundle`
  ).toMatch(workframeCssRegExp)
  const workframeJsFile = content.match(workframeJsRegExp)[1]
  await expect(
    stat(resolve(atelierOut, workframeJsFile)),
    `${workframeJsFile} does not exist`
  ).resolves.toBeDefined()
  const workframeCssFile = content.match(workframeCssRegExp)[1]
  await expect(
    stat(resolve(atelierOut, workframeCssFile)),
    `${workframeCssFile} does not exist`
  ).resolves.toBeDefined()
}

async function expectUiDistribution(atelierOut) {
  const indexHtmlPath = resolve(atelierOut, 'index.html')
  const indexJsRegExp =
    /<script type="module" crossorigin src="\.\/(assets\/index-.+\.js)">/
  const indexCssRegExp =
    /<link rel="stylesheet" crossorigin href="\.\/(assets\/index-.+\.css)">/

  await expect(stat(indexHtmlPath)).resolves.toBeDefined()
  const content = await readFile(indexHtmlPath, 'utf-8')
  expect(
    content,
    `${content} does not include expected path to JS bundle`
  ).toMatch(indexJsRegExp)
  expect(
    content,
    `${content} does not include expected path to Css bundle`
  ).toMatch(indexCssRegExp)
  const workframeJsFile = content.match(indexJsRegExp)[1]
  await expect(
    stat(resolve(atelierOut, workframeJsFile)),
    `${workframeJsFile} does not exist`
  ).resolves.toBeDefined()
  const workframeCssFile = content.match(indexCssRegExp)[1]
  await expect(
    stat(resolve(atelierOut, workframeCssFile)),
    `${workframeCssFile} does not exist`
  ).resolves.toBeDefined()
}
