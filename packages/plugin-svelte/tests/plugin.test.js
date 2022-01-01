const { EventEmitter } = require('events')
const http = require('http')
const { resolve } = require('path')
const connect = require('connect')
const faker = require('faker')
const got = require('got')
const builder = require('../src')

const defaultWorkframeId = '@atelier-wb/workframe'
const defaultUrl = '/atelier/'
const path = resolve(__dirname, 'fixtures', 'nested')

describe('plugin builder', () => {
  beforeEach(jest.resetAllMocks)

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

  describe('given some files', () => {
    it('applies default options', () => {
      expect(builder()).toEqual({
        name: builder.pluginName,
        apply: 'serve',
        configureServer: expect.any(Function),
        resolveId: expect.any(Function),
        load: expect.any(Function)
      })
    })

    it('does not handle other ids than workframeId', async () => {
      const plugin = builder()
      expect(plugin.resolveId(faker.lorem.word())).not.toBeDefined()
      expect(await plugin.load(faker.lorem.word())).not.toBeDefined()
      expect(plugin.resolveId(`${defaultUrl}${defaultWorkframeId}`)).toEqual(
        `${defaultUrl}${defaultWorkframeId}`
      )
    })

    it('supports custom workframeId', async () => {
      const workframeId = faker.lorem.word()
      const plugin = builder({ workframeId })
      expect(plugin.resolveId(faker.lorem.word())).not.toBeDefined()
      expect(await plugin.load(faker.lorem.word())).not.toBeDefined()
      expect(plugin.resolveId(`${defaultUrl}${workframeId}`)).toEqual(
        `${defaultUrl}${workframeId}`
      )
    })

    it('finds tool files and generates workframe content', async () => {
      const plugin = builder({ path })
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
      const plugin = builder({ path, toolRegexp: '\\.custom\\.svelte$' })
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
      const plugin = builder({ path, setupPath })
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
      const plugin = builder({ path, setupPath: `./${setupPath}` })
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
      const plugin = builder({ path, setupPath })
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
    let plugin
    let server
    let address
    let watcher
    let url = '/atelier/'

    beforeEach(async () => {
      plugin = builder({
        url: url,
        path,
        publicDir: [
          resolve(__dirname, 'fixtures', 'static1'),
          resolve(__dirname, 'fixtures', 'static2')
        ]
      })
      const middlewares = connect()
      server = http.createServer(middlewares)
      watcher = new EventEmitter()
      await plugin.configureServer({ middlewares, watcher })
      await new Promise((resolve, reject) =>
        server.listen(err => (err ? reject(err) : resolve()))
      )
      address = `http://localhost:${server.address().port}`
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
          '<script type="module" crossorigin src="assets/index.'
        )
      )
      expect(response.body).toEqual(
        expect.stringContaining('<link rel="stylesheet" href="assets/index.')
      )
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
        const emit = jest.spyOn(watcher, 'emit')
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
      const emit = jest.spyOn(watcher, 'emit')
      expect(emit).not.toHaveBeenCalled()

      watcher.emit(eventName, resolve(path, file), { isDirectory: () => false })
      expect(emit).not.toHaveBeenCalledWith(
        'change',
        `${url}/${defaultWorkframeId}`
      )
      expect(emit).toHaveBeenCalledTimes(1)
    })
  })
})
