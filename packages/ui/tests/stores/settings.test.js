import { faker } from '@faker-js/faker'
import { firstValueFrom } from 'rxjs'
import { get } from 'svelte/store'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getSettings, reloadSettings } from '../../src/stores'

describe('settings store', () => {
  beforeEach(() => {
    vi.resetAllMocks()
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

    expect(get(getSettings('foo'))).toBe('enabled')
    expect(get(getSettings('bar'))).toBe(10)
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

  it('applies validation', async () => {
    let fooSettings = getSettings('foo', { type: 'boolean' })

    window.uiSettings = { foo: 'bar' }
    reloadSettings()
    await expect(firstValueFrom(fooSettings)).rejects.toThrow(
      'data must be boolean'
    )

    window.uiSettings = { foo: true }
    reloadSettings()
    expect(await firstValueFrom(fooSettings)).toBe(true)

    window.uiSettings = {}
    reloadSettings()
    expect(await firstValueFrom(fooSettings)).toBeUndefined()
  })
})
