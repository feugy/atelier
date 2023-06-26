import { faker } from '@faker-js/faker'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { join, resolve } from 'path'
import { configureToolshot } from '../src'

const nestedFixtures = resolve(__dirname, 'fixtures', 'nested')
const fixtures = resolve(__dirname, 'fixtures')
const sleep = duration => new Promise(resolve => setTimeout(resolve, duration))

describe('toolshot builder', () => {
  beforeEach(vi.resetAllMocks)

  describe('given nor running in test environment', () => {
    const save = {}
    beforeEach(() => {
      save.test = global.test
      save.describe = global.describe
    })

    afterEach(() => {
      Object.assign(global, save)
    })

    it('throws an error when test() is not defined', () => {
      global.test = undefined
      expect(() => configureToolshot()).toThrow(
        'configureToolshot() needs global describe(), afterAll(), test() and expect.extend() functions'
      )
    })

    it('throws an error when describe() is not defined', () => {
      global.describe = undefined
      expect(() => configureToolshot()).toThrow(
        'configureToolshot() needs global describe(), afterAll(), test() and expect.extend() functions'
      )
    })
  })

  describe('given mocked test global', () => {
    let testSpy
    let describeSpy
    let matchFileSnapshot

    beforeEach(() => {
      testSpy = vi.spyOn(global, 'test').mockImplementation(() => {})
      describeSpy = vi
        .spyOn(global, 'describe')
        .mockImplementation((name, content) => content())
      matchFileSnapshot = vi.fn().mockReturnValue({ pass: true })
      expect.extend({ toMatchFileSnapshot: matchFileSnapshot })
    })

    it('groups tools in a single suite', () => {
      expect(describeSpy).not.toHaveBeenCalled()
      configureToolshot({ folder: nestedFixtures })
      expect(describeSpy).toHaveBeenCalledWith('Toolshot', expect.any(Function))
      expect(describeSpy).toHaveBeenCalledTimes(1)
    })

    it('can configure the suite name', () => {
      expect(describeSpy).not.toHaveBeenCalled()
      const suite = 'My custom suite name'
      configureToolshot({ suite, folder: nestedFixtures })
      expect(describeSpy).toHaveBeenCalledWith(suite, expect.any(Function))
      expect(describeSpy).toHaveBeenCalledTimes(1)
    })

    it('finds as many tests as tool files', () => {
      expect(testSpy).not.toHaveBeenCalled()
      configureToolshot({ folder: nestedFixtures })
      expect(testSpy).toHaveBeenCalledWith(
        'a.tools.svelte',
        expect.any(Function),
        5000
      )
      expect(testSpy).toHaveBeenCalledWith(
        'b.tools.svelte',
        expect.any(Function),
        5000
      )
      expect(testSpy).toHaveBeenCalledWith(
        join('folder1', 'b.tools.svelte'),
        expect.any(Function),
        5000
      )
      expect(testSpy).toHaveBeenCalledWith(
        join('folder1', 'd.tools.svelte'),
        expect.any(Function),
        5000
      )
      expect(testSpy).toHaveBeenCalledWith(
        join('folder1', 'folder1', 'b.tools.svelte'),
        expect.any(Function),
        5000
      )
      expect(testSpy).toHaveBeenCalledWith(
        join('folder2', 'c.tools.svelte'),
        expect.any(Function),
        5000
      )
      expect(testSpy).toHaveBeenCalledWith(
        join('folder2', 'folder1', 'a.tools.svelte'),
        expect.any(Function),
        5000
      )
      expect(testSpy).toHaveBeenCalledTimes(7)
    })

    it('can configure the tool file pattern', () => {
      expect(testSpy).not.toHaveBeenCalled()
      configureToolshot({
        folder: nestedFixtures,
        include: '\\.custom\\.svelte$'
      })
      expect(testSpy).toHaveBeenCalledWith(
        'c.custom.svelte',
        expect.any(Function),
        5000
      )
      expect(testSpy).toHaveBeenCalledWith(
        join('folder1', 'a.custom.svelte'),
        expect.any(Function),
        5000
      )
      expect(testSpy).toHaveBeenCalledWith(
        join('folder1', 'folder1', 'c.custom.svelte'),
        expect.any(Function),
        5000
      )
      expect(testSpy).toHaveBeenCalledWith(
        join('folder2', 'b.custom.svelte'),
        expect.any(Function),
        5000
      )
      expect(testSpy).toHaveBeenCalledWith(
        join('folder2', 'folder2', 'a.custom.svelte'),
        expect.any(Function),
        5000
      )
      expect(testSpy).toHaveBeenCalledTimes(5)
    })

    it('can configure the test timeout', () => {
      const timeout = faker.number.int(999)
      configureToolshot({
        folder: fixtures,
        include: 'single.tools.svelte',
        timeout
      })
      expect(testSpy).toHaveBeenCalledTimes(1)
      expect(testSpy).toHaveBeenCalledWith(
        'single.tools.svelte',
        expect.any(Function),
        timeout
      )
    })

    it('loads tool file and assert single result', async () => {
      configureToolshot({
        folder: fixtures,
        include: 'single.tools.svelte'
      })
      expect(testSpy).toHaveBeenCalledTimes(1)
      await testSpy.mock.calls[0][1]()
      await sleep(100)
      expect(matchFileSnapshot).toHaveBeenCalledWith(
        document.querySelector('p'),
        join(fixtures, '__snapshots__', 'single.tools.shot'),
        'single tool'
      )
      expect(matchFileSnapshot).toHaveBeenCalledTimes(1)
    })

    it('loads tool file and assert multiple results', async () => {
      const snapshotFile = join(
        fixtures,
        '__snapshots__',
        'multiple.tools.shot'
      )
      configureToolshot({
        folder: fixtures,
        include: 'multiple.tools.svelte'
      })
      expect(testSpy).toHaveBeenCalledTimes(1)
      await testSpy.mock.calls[0][1]()
      await sleep(100)
      const h1 = document.createElement('h1')
      h1.innerHTML = 'first'
      const h2 = document.createElement('h2')
      h2.innerHTML = 'second'
      const h3 = document.createElement('h3')
      h3.innerHTML = 'third'
      expect(matchFileSnapshot).toHaveBeenNthCalledWith(
        1,
        h1,
        snapshotFile,
        'first tool'
      )
      expect(matchFileSnapshot).toHaveBeenNthCalledWith(
        2,
        h2,
        snapshotFile,
        'second tool'
      )
      expect(matchFileSnapshot).toHaveBeenNthCalledWith(
        3,
        h3,
        snapshotFile,
        'third tool'
      )
      expect(matchFileSnapshot).toHaveBeenCalledTimes(3)
    })

    it('can configure snapshot folder name', async () => {
      configureToolshot({
        folder: fixtures,
        include: 'single.tools.svelte',
        snapshotFolder: '__custom__'
      })
      expect(testSpy).toHaveBeenCalledTimes(1)
      await testSpy.mock.calls[0][1]()
      await sleep(100)
      expect(matchFileSnapshot).toHaveBeenCalledWith(
        document.querySelector('p'),
        join(fixtures, '__custom__', 'single.tools.shot'),
        'single tool'
      )
      expect(matchFileSnapshot).toHaveBeenCalledTimes(1)
    })
  })
})
