import { faker } from '@faker-js/faker'
import { join, resolve } from 'path'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

const nestedFixtures = resolve(__dirname, 'fixtures', 'nested')
const fixtures = resolve(__dirname, 'fixtures')
const sleep = duration => new Promise(resolve => setTimeout(resolve, duration))

const spies = vi.hoisted(() => {
  const toMatchToolshot = vi.fn(() => ({ pass: true }))
  const matchers = { toMatchToolshot }
  const expect = vi.fn(() => matchers)
  expect.extend = () => {}
  const spies = {
    it: vi.fn(),
    afterAll: vi.fn(),
    describe: vi.fn((name, content) => content()),
    toMatchToolshot,
    expect
  }
  return spies
})

vi.mock('vitest', () => spies)

describe('toolshot builder', () => {
  let configureToolshot

  beforeAll(async () => {
    ({ configureToolshot } = await import('../src'))
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('given mocked test global', () => {
    it('groups tools in a single suite', () => {
      expect(spies.describe).not.toHaveBeenCalled()
      configureToolshot({ folder: nestedFixtures })
      expect(spies.describe).toHaveBeenCalledWith(
        'Toolshot',
        expect.any(Function)
      )
      expect(spies.describe).toHaveBeenCalledTimes(1)
    })

    it('can configure the suite name', () => {
      expect(spies.describe).not.toHaveBeenCalled()
      const suite = 'My custom suite name'
      configureToolshot({ suite, folder: nestedFixtures })
      expect(spies.describe).toHaveBeenCalledWith(suite, expect.any(Function))
      expect(spies.describe).toHaveBeenCalledTimes(1)
    })

    it('finds as many tests as tool files', () => {
      expect(spies.it).not.toHaveBeenCalled()
      configureToolshot({ folder: nestedFixtures })
      expect(spies.it).toHaveBeenCalledWith(
        'a.tools.svelte',
        expect.any(Function),
        5000
      )
      expect(spies.it).toHaveBeenCalledWith(
        'b.tools.svelte',
        expect.any(Function),
        5000
      )
      expect(spies.it).toHaveBeenCalledWith(
        join('folder1', 'b.tools.svelte'),
        expect.any(Function),
        5000
      )
      expect(spies.it).toHaveBeenCalledWith(
        join('folder1', 'd.tools.svelte'),
        expect.any(Function),
        5000
      )
      expect(spies.it).toHaveBeenCalledWith(
        join('folder1', 'folder1', 'b.tools.svelte'),
        expect.any(Function),
        5000
      )
      expect(spies.it).toHaveBeenCalledWith(
        join('folder2', 'c.tools.svelte'),
        expect.any(Function),
        5000
      )
      expect(spies.it).toHaveBeenCalledWith(
        join('folder2', 'folder1', 'a.tools.svelte'),
        expect.any(Function),
        5000
      )
      expect(spies.it).toHaveBeenCalledTimes(7)
    })

    it('can configure the tool file pattern', () => {
      expect(spies.it).not.toHaveBeenCalled()
      configureToolshot({
        folder: nestedFixtures,
        include: '\\.custom\\.svelte$'
      })
      expect(spies.it).toHaveBeenCalledWith(
        'c.custom.svelte',
        expect.any(Function),
        5000
      )
      expect(spies.it).toHaveBeenCalledWith(
        join('folder1', 'a.custom.svelte'),
        expect.any(Function),
        5000
      )
      expect(spies.it).toHaveBeenCalledWith(
        join('folder1', 'folder1', 'c.custom.svelte'),
        expect.any(Function),
        5000
      )
      expect(spies.it).toHaveBeenCalledWith(
        join('folder2', 'b.custom.svelte'),
        expect.any(Function),
        5000
      )
      expect(spies.it).toHaveBeenCalledWith(
        join('folder2', 'folder2', 'a.custom.svelte'),
        expect.any(Function),
        5000
      )
      expect(spies.it).toHaveBeenCalledTimes(5)
    })

    it('can configure the test timeout', () => {
      const timeout = faker.number.int(999)
      configureToolshot({
        folder: fixtures,
        include: 'single.tools.svelte',
        timeout
      })
      expect(spies.it).toHaveBeenCalledTimes(1)
      expect(spies.it).toHaveBeenCalledWith(
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
      expect(spies.it).toHaveBeenCalledTimes(1)
      await spies.it.mock.calls[0][1]()
      await sleep(100)
      expect(spies.toMatchToolshot).toHaveBeenCalledWith(
        // document.querySelector('p'),
        join(fixtures, '__snapshots__', 'single.tools.shot'),
        'single tool'
      )
      expect(spies.toMatchToolshot).toHaveBeenCalledTimes(1)
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
      expect(spies.it).toHaveBeenCalledTimes(1)
      await spies.it.mock.calls[0][1]()
      await sleep(100)
      const h1 = document.createElement('h1')
      h1.innerHTML = 'first'
      const h2 = document.createElement('h2')
      h2.innerHTML = 'second'
      const h3 = document.createElement('h3')
      h3.innerHTML = 'third'
      expect(spies.toMatchToolshot).toHaveBeenNthCalledWith(
        1,
        // h1,
        snapshotFile,
        'first tool'
      )
      expect(spies.toMatchToolshot).toHaveBeenNthCalledWith(
        2,
        // h2,
        snapshotFile,
        'second tool'
      )
      expect(spies.toMatchToolshot).toHaveBeenNthCalledWith(
        3,
        // h3,
        snapshotFile,
        'third tool'
      )
      expect(spies.toMatchToolshot).toHaveBeenCalledTimes(3)
    })

    it('can configure snapshot folder name', async () => {
      configureToolshot({
        folder: fixtures,
        include: 'single.tools.svelte',
        snapshotFolder: '__custom__'
      })
      expect(spies.it).toHaveBeenCalledTimes(1)
      await spies.it.mock.calls[0][1]()
      await sleep(100)
      expect(spies.toMatchToolshot).toHaveBeenCalledWith(
        // document.querySelector('p'),
        join(fixtures, '__custom__', 'single.tools.shot'),
        'single tool'
      )
      expect(spies.toMatchToolshot).toHaveBeenCalledTimes(1)
    })
  })
})
