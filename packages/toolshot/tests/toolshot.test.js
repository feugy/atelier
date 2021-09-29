import { jest } from '@jest/globals'
import { join, resolve } from 'path'
import { configureToolshot } from '../src'

const nestedFixtures = resolve(__dirname, 'fixtures', 'nested')
const fixtures = resolve(__dirname, 'fixtures')
const sleep = duration => new Promise(resolve => setTimeout(resolve, duration))

describe('toolshot builder', () => {
  beforeEach(jest.resetAllMocks)

  describe('given nor running in jest', () => {
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
        'configureToolshot() must run within Jest context'
      )
    })

    it('throws an error when describe() is not defined', () => {
      global.describe = undefined
      expect(() => configureToolshot()).toThrow(
        'configureToolshot() must run within Jest context'
      )
    })
  })

  describe('given mocked test global', () => {
    let testSpy
    let describeSpy
    let matchSpecificSnapshot

    beforeEach(() => {
      testSpy = jest.spyOn(global, 'test').mockImplementation(() => {})
      describeSpy = jest
        .spyOn(global, 'describe')
        .mockImplementation((name, content) => content())
      matchSpecificSnapshot = jest.fn().mockReturnValue({ pass: true })
      expect.extend({ toMatchSpecificSnapshot: matchSpecificSnapshot })
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
        expect.any(Function)
      )
      expect(testSpy).toHaveBeenCalledWith(
        'b.tools.svelte',
        expect.any(Function)
      )
      expect(testSpy).toHaveBeenCalledWith(
        join('folder1', 'b.tools.svelte'),
        expect.any(Function)
      )
      expect(testSpy).toHaveBeenCalledWith(
        join('folder1', 'd.tools.svelte'),
        expect.any(Function)
      )
      expect(testSpy).toHaveBeenCalledWith(
        join('folder1', 'folder1', 'b.tools.svelte'),
        expect.any(Function)
      )
      expect(testSpy).toHaveBeenCalledWith(
        join('folder2', 'c.tools.svelte'),
        expect.any(Function)
      )
      expect(testSpy).toHaveBeenCalledWith(
        join('folder2', 'folder1', 'a.tools.svelte'),
        expect.any(Function)
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
        expect.any(Function)
      )
      expect(testSpy).toHaveBeenCalledWith(
        join('folder1', 'a.custom.svelte'),
        expect.any(Function)
      )
      expect(testSpy).toHaveBeenCalledWith(
        join('folder1', 'folder1', 'c.custom.svelte'),
        expect.any(Function)
      )
      expect(testSpy).toHaveBeenCalledWith(
        join('folder2', 'b.custom.svelte'),
        expect.any(Function)
      )
      expect(testSpy).toHaveBeenCalledWith(
        join('folder2', 'folder2', 'a.custom.svelte'),
        expect.any(Function)
      )
      expect(testSpy).toHaveBeenCalledTimes(5)
    })

    it('loads tool file and assert single result', async () => {
      configureToolshot({
        folder: fixtures,
        include: 'single.tools.svelte'
      })
      expect(testSpy).toHaveBeenCalledTimes(1)
      await testSpy.mock.calls[0][1]()
      await sleep(100)
      expect(matchSpecificSnapshot).toHaveBeenCalledWith(
        document.querySelector('p'),
        join(fixtures, '__snapshots__', 'single.tools.shot')
      )
      expect(matchSpecificSnapshot).toHaveBeenCalledTimes(1)
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
      expect(matchSpecificSnapshot).toHaveBeenNthCalledWith(1, h1, snapshotFile)
      expect(matchSpecificSnapshot).toHaveBeenNthCalledWith(2, h2, snapshotFile)
      expect(matchSpecificSnapshot).toHaveBeenNthCalledWith(3, h3, snapshotFile)
      expect(matchSpecificSnapshot).toHaveBeenCalledTimes(3)
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
      expect(matchSpecificSnapshot).toHaveBeenCalledWith(
        document.querySelector('p'),
        join(fixtures, '__custom__', 'single.tools.shot')
      )
      expect(matchSpecificSnapshot).toHaveBeenCalledTimes(1)
    })
  })
})
