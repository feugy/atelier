import { render, screen } from '@testing-library/svelte'
import html from 'svelte-htm'
import faker from 'faker'
import { translate } from '../test-utils'
import { EventLogger } from '../../src/components'

describe('EventLogger component', () => {
  beforeEach(jest.resetAllMocks)

  it('handles no events', async () => {
    render(html`<${EventLogger} />`)
    expect(screen.getByText(translate('message.no-events'))).toBeInTheDocument()
  })

  it('display event log', async () => {
    const events = [
      { name: faker.lorem.words(), time: Date.now(), args: [] },
      { name: faker.lorem.words(), time: Date.now() - 5e3, args: [] }
    ]
    render(html`<${EventLogger} events=${events} />`)
    expect(screen.getByText(events[0].name)).toBeInTheDocument()
    expect(
      screen.getByText(translate('{ time, time }', events[0]))
    ).toBeInTheDocument()
    expect(screen.getByText(events[1].name)).toBeInTheDocument()
    expect(
      screen.getByText(translate('{ time, time }', events[1]))
    ).toBeInTheDocument()
  })
})
