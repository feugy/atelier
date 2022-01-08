import faker from 'faker'
import { get } from 'svelte/store'
import { reloadSettings, getSettings } from '../../src/stores'

describe('settings store', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    delete window.uiSettings
    reloadSettings()
  })

  it('handles no settings', () => {
    expect(get(getSettings(faker.lorem.word()))).toBeUndefined()
  })

  it('handles missing key', () => {
    window.uiSettings = {}
    reloadSettings()
    expect(get(getSettings(faker.lorem.word()))).toBeUndefined()
  })

  it('returns an observable for a given settings key', () => {
    const key = faker.lorem.word()
    const value = { fullName: 'Ziggy Stardust' }
    window.uiSettings = { foo: 'enabled', bar: 10, [key]: value }
    reloadSettings()

    expect(get(getSettings('foo'))).toEqual('enabled')
    expect(get(getSettings('bar'))).toEqual(10)
    expect(get(getSettings(key))).toEqual(value)
  })

  it('reloads all settings and updates observables', () => {
    const value = faker.lorem.word()
    window.uiSettings = { foo: value }
    reloadSettings()

    const fooSettings = getSettings('foo')
    expect(get(fooSettings)).toEqual(value)

    const newValue = faker.lorem.word()
    window.uiSettings = { foo: newValue }
    expect(get(fooSettings)).toEqual(value)

    reloadSettings()
    expect(get(fooSettings)).toEqual(newValue)
  })
})
