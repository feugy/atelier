import { render } from '@testing-library/svelte'
import html from 'svelte-htm'
import faker from 'faker'
import { Tool } from '../test-components'
import { ToolBox } from '../../src'

describe('ToolBox component', () => {
  let context

  function setContext({ detail }) {
    context = detail
  }

  beforeEach(() => {
    jest.resetAllMocks()
    context = null
  })

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
    const events = [faker.datatype.number(), faker.datatype.number()]
    const component = faker.datatype.uuid()
    const setup = function () {}
    const teardown = function () {}
    const data = { foo: faker.datatype.uuid() }
    const custom = [faker.datatype.number(), faker.datatype.number()]
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
