import { faker } from '@faker-js/faker'
import { cleanup, render } from '@testing-library/svelte'
import html from 'svelte-htm'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ToolBox } from '../../src'
import { Tool } from '../test-components'

describe('ToolBox component', () => {
  let context

  function setContext({ detail }) {
    context = detail
  }

  beforeEach(() => {
    vi.resetAllMocks()
    context = null
  })

  afterEach(cleanup)

  it('allows no properties', async () => {
    render(html`<${ToolBox}><${Tool} on:context=${setContext}/></${ToolBox}>`)
    expect(context).toEqual({
      name: null,
      component: null,
      events: [],
      props: {},
      setup: null,
      teardown: null,
      data: {}
    })
  })

  it('exposes its properties through context', async () => {
    const name = faker.lorem.words()
    const events = [faker.number.int(999), faker.number.int(999)]
    const component = faker.string.uuid()
    const setup = function () {}
    const teardown = function () {}
    const data = { foo: faker.string.uuid() }
    const custom = [faker.number.int(999), faker.number.int(999)]
    render(
      html`<${ToolBox} name=${name} component=${component} events=${events} setup=${setup} teardown=${teardown} data=${data} custom=${custom}>
        <${Tool} on:context=${setContext}/>
      </${ToolBox}>`
    )
    expect(context).toEqual({
      name,
      component,
      events,
      props: {},
      setup,
      teardown,
      data: { data, custom }
    })
  })
})
