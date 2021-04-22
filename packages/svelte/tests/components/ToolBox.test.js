import { render, screen } from '@testing-library/svelte'
import html from 'svelte-htm'
import faker from 'faker'
import { Tool } from '../test-components'
import { ToolBox } from '../../src'

describe('ToolBox component', () => {
  beforeEach(jest.resetAllMocks)

  it('allows no properties', async () => {
    render(html`<${ToolBox}><${Tool} /></${ToolBox}>`)
    const main = screen.queryByRole('main')
    expect(main).toBeInTheDocument()
    expect(JSON.parse(main.textContent)).toEqual({
      name: null,
      component: null,
      events: [],
      props: {}
    })
  })

  it('exposes its properties through context', () => {
    const name = faker.lorem.words()
    const events = [faker.datatype.number(), faker.datatype.number()]
    const component = faker.datatype.uuid()
    render(
      html`<${ToolBox} name=${name} component=${component} events=${events}><${Tool} /></${ToolBox}>`
    )
    const main = screen.queryByRole('main')
    expect(main).toBeInTheDocument()
    expect(JSON.parse(main.textContent)).toEqual({
      name,
      component,
      events,
      props: {}
    })
  })
})
