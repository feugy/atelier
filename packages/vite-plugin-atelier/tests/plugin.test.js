const { faker } = require('@faker-js/faker')
const { svelte } = require('@sveltejs/vite-plugin-svelte')
const { EventEmitter } = require('events')
const { readFile, rm, stat } = require('fs/promises')
const http = require('http')
const { resolve } = require('path')
const connect = require('connect')
const got = require('got')
const { build } = require('vite')
const builder = require('../src')

const defaultWorkframeId = '@atelier-wb/workframe'
const defaultUrl = '/atelier/'
const path = resolve(__dirname, 'fixtures', 'nested')

async function configureAndStartServer(options) {
  const plugin = builder(options)
  const middlewares = connect()
  const server = http.createServer(middlewares)
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

function preparePlugin(
  options = {},
  viteEnv = { command: 'serve' },
  skipValidation = false
) {
  const plugin = builder(options, skipValidation)
  plugin.config({ root: '' }, viteEnv)
  return plugin
}

describe('plugin builder', () => {
  beforeEach(vi.resetAllMocks)

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
      `Invalid regular expression: /${toolRegexp}/: Unterminated group`
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
    expect(() => builder({ outDir: null })).not.toThrow()
  })

  describe('given some files', () => {
    it('does not handle other ids than workframeId', async () => {
      const plugin = preparePlugin()
      expect(plugin.resolveId(faker.lorem.word())).not.toBeDefined()
      expect(await plugin.load(faker.lorem.word())).not.toBeDefined()
      expect(plugin.resolveId(`${defaultUrl}${defaultWorkframeId}`)).toEqual(
        `${defaultUrl}${defaultWorkframeId}`
      )
    })

    it('supports custom workframeId', async () => {
      const workframeId = faker.lorem.word()
      const plugin = preparePlugin({ workframeId })
      expect(plugin.resolveId(faker.lorem.word())).not.toBeDefined()
      expect(await plugin.load(faker.lorem.word())).not.toBeDefined()
      expect(plugin.resolveId(`${defaultUrl}${workframeId}`)).toEqual(
        `${defaultUrl}${workframeId}`
      )
    })

    it('throws on unavailbable framework bindings', async () => {
      const framework = 'jquery'
      const plugin = preparePlugin({ path, framework }, undefined, true)
      await expect(
        plugin.load(`${defaultUrl}${defaultWorkframeId}`)
      ).rejects.toThrow(
        `Could not load framework bindings for ${framework}. Please add to your dependencies: npm i -D @atelier-wb/${framework}`
      )
    })

    it('finds tool files and generates workframe content', async () => {
      const plugin = preparePlugin({ path })
      expect(await plugin.load(`${defaultUrl}${defaultWorkframeId}`))
        .toEqual(`import { Workbench } from '@atelier-wb/svelte'

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
      const path = resolve(__dirname, 'fixtures', 'nested')
      const plugin = preparePlugin({ path, toolRegexp: '\\.custom\\.svelte$' })
      expect(await plugin.load(`${defaultUrl}${defaultWorkframeId}`))
        .toEqual(`import { Workbench } from '@atelier-wb/svelte'

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
      const plugin = preparePlugin({ path, setupPath })
      expect(await plugin.load(`${defaultUrl}${defaultWorkframeId}`))
        .toEqual(`import { Workbench } from '@atelier-wb/svelte'

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
      const plugin = preparePlugin({ path, setupPath: `./${setupPath}` })
      expect(await plugin.load(`${defaultUrl}${defaultWorkframeId}`))
        .toEqual(`import { Workbench } from '@atelier-wb/svelte'

import '${resolve(path, setupPath)}'
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
      const setupPath = resolve(path, faker.lorem.word())
      const plugin = preparePlugin({ path, setupPath })
      expect(await plugin.load(`${defaultUrl}${defaultWorkframeId}`))
        .toEqual(`import { Workbench } from '@atelier-wb/svelte'

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
  })

  describe('given a configured and started server', () => {
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

      const response = await got(`${address}${url}ui-settings.js`)
      expect(response.statusCode).toEqual(200)
      expect(response.headers).toEqual(
        expect.objectContaining({
          'content-type': 'application/javascript;charset=utf-8'
        })
      )
      expect(response.body).toEqual(
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
      const response = await got(`${address}${url}`)
      expect(response.statusCode).toEqual(200)
      expect(response.headers).toEqual(
        expect.objectContaining({ 'content-type': 'text/html;charset=utf-8' })
      )
      expect(response.body).toEqual(
        expect.stringContaining(
          '<script type="module" crossorigin src="./assets/index.'
        )
      )
      expect(response.body).toEqual(
        expect.stringContaining('<link rel="stylesheet" href="./assets/index.')
      )
    })

    it(`serves script with empty ui settings`, async () => {
      const response = await got(`${address}${url}ui-settings.js`)
      expect(response.statusCode).toEqual(200)
      expect(response.headers).toEqual(
        expect.objectContaining({
          'content-type': 'application/javascript;charset=utf-8'
        })
      )
      expect(response.body).toEqual('window.uiSettings = {};')
    })

    it(`serves files from public dir`, async () => {
      let response = await got(`${address}${url}icon-256x256.png`)
      expect(response.statusCode).toEqual(200)
      expect(response.headers).toEqual(
        expect.objectContaining({ 'content-type': 'image/png' })
      )
      response = await got(`${address}${url}favicon.ico`)
      expect(response.statusCode).toEqual(200)
      expect(response.headers).toEqual(
        expect.objectContaining({ 'content-length': '1150' })
      )
      await expect(got(`${address}${url}unknown.jpeg`)).rejects.toThrow('404')
    })

    it(`redirects to atelier's main html file without trailing /`, async () => {
      const response = await got(`${address}${url.slice(0, -1)}`, {
        followRedirect: false
      })
      expect(response.statusCode).toEqual(301)
      expect(response.headers).toEqual(
        expect.objectContaining({ location: url })
      )
    })

    it(`serves atelier's workframe`, async () => {
      const response = await got(`${address}${url}workframe.html`)
      expect(response.statusCode).toEqual(200)
      expect(response.headers).toEqual(
        expect.objectContaining({ 'content-type': 'text/html' })
      )
      expect(response.body).toMatchInlineSnapshot(`
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

  describe('given a built simple application', () => {
    const root = resolve(__dirname, 'fixtures/simple')
    const atelierOut = resolve(root, 'dist-atelier')
    const uiSettings = { foo: faker.lorem.words() }

    beforeAll(async () => {
      await rm(atelierOut, { recursive: true, force: true })
      await build({
        root,
        logLevel: 'silent',
        plugins: [svelte(), builder({ uiSettings })]
      })
    })

    it(`generated workframe file with its assets`, async () => {
      await expectWorkframeAndAssets(atelierOut)
    })

    it(`included ui distribution`, async () => {
      await expectUiDistribution(atelierOut)
    })

    it(`generated ui-settings file`, async () => {
      const settingsPath = resolve(atelierOut, 'ui-settings.js')
      await expect(stat(settingsPath)).resolves.toBeDefined()
      expect(await readFile(settingsPath, 'utf-8')).toEqual(
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
        logLevel: 'silent',
        plugins: [svelte(), builder({ outDir: 'dist-atelier/custom-out' })]
      })
    })

    it(`generated workframe file with its assets`, async () => {
      await expectWorkframeAndAssets(atelierOut)
    })

    it(`included ui distribution`, async () => {
      await expectUiDistribution(atelierOut)
    })
  })

  describe('given a built application with entry point', () => {
    const root = resolve(__dirname, 'fixtures/with-entry')
    const atelierOut = resolve(root, 'dist-atelier')

    beforeAll(async () => {
      await rm(atelierOut, { recursive: true, force: true })
      await build({
        root,
        logLevel: 'silent',
        plugins: [svelte(), builder()]
      })
    })

    it(`generated workframe file and index file`, async () => {
      await expectWorkframeAndAssets(atelierOut)
      await expect(
        stat(resolve(root, 'dist/index.html'))
      ).resolves.toBeDefined()
    })

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
        logLevel: 'silent',
        plugins: [svelte(), builder({ path })]
      })
    })

    it(`generated workframe file with its assets`, async () => {
      await expectWorkframeAndAssets(atelierOut)
    })

    it(`included ui distribution`, async () => {
      await expectUiDistribution(atelierOut)
    })
  })

  describe('given null outDir', () => {
    const root = resolve(__dirname, 'fixtures/with-entry')
    const atelierOut = resolve(root, 'dist-atelier')

    beforeAll(async () => {
      await rm(atelierOut, { recursive: true, force: true })
      await build({
        root,
        logLevel: 'silent',
        plugins: [svelte(), builder({ outDir: null })]
      })
    })

    it(`does not generate workframe file`, async () => {
      await expect(
        stat(resolve(root, 'dist/index.html'))
      ).resolves.toBeDefined()
      await expect(stat(resolve(atelierOut, 'workframe.html'))).rejects.toThrow(
        'ENOENT'
      )
    })
  })

  describe('given a built application with public directories', () => {
    const root = resolve(__dirname, 'fixtures/public-dirs')
    const atelierOut = resolve(root, 'dist-atelier')

    beforeAll(async () => {
      await rm(atelierOut, { recursive: true, force: true })
      await build({
        root,
        logLevel: 'silent',
        plugins: [svelte(), builder({ publicDir: ['./static'] })]
      })
    })

    it(`generated workframe file with its assets`, async () => {
      await expectWorkframeAndAssets(atelierOut)
    })

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
})

async function expectWorkframeAndAssets(atelierOut) {
  const workframeHtmlPath = resolve(atelierOut, 'workframe.html')
  const workframeJsRegExp =
    /<script type="module" crossorigin src="\.\/(assets\/workframe\.\w+\.js)">/
  const workframeCssRegExp =
    /<link rel="stylesheet" href="\.\/(assets\/workframe\.\w+\.css)">/

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
  const workframeJsRegExp =
    /<script type="module" crossorigin src="\.\/(assets\/index\.\w+\.js)">/
  const workframeCssRegExp =
    /<link rel="stylesheet" href="\.\/(assets\/index\.\w+\.css)">/

  await expect(stat(indexHtmlPath)).resolves.toBeDefined()
  const content = await readFile(indexHtmlPath, 'utf-8')
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
