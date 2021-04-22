import { fireEvent, render, screen } from '@testing-library/svelte'
import html from 'svelte-htm'
import faker from 'faker'
import { translate } from '../test-utils'
import { EventsPane } from '../../src/connected-components'
import { events, clearEvents } from '../../src/stores'

jest.mock('../../src/stores/tools', () => ({
  events: new (require('rxjs').BehaviorSubject)(),
  clearEvents: jest.fn()
}))

describe('EventLogger connected component', () => {
  beforeEach(jest.resetAllMocks)

  it('handles no events', () => {
    events.next([])
    render(html`<${EventsPane} />`)
    expect(screen.getByText(translate('message.no-events'))).toBeInTheDocument()
    expect(screen.queryAllByRole('button')).toHaveLength(0)
    expect(clearEvents).not.toHaveBeenCalled()
  })

  it('displays event log', () => {
    const eventData = [
      { name: faker.lorem.words(), time: Date.now(), args: [] },
      { name: faker.lorem.words(), time: Date.now() - 5e3, args: [] }
    ]
    events.next(eventData)
    render(html`<${EventsPane} />`)
    expect(screen.getByText(eventData[0].name)).toBeInTheDocument()
    expect(
      screen.getByText(translate('{ time, time }', eventData[0]))
    ).toBeInTheDocument()
    expect(screen.getByText(eventData[1].name)).toBeInTheDocument()
    expect(
      screen.getByText(translate('{ time, time }', eventData[1]))
    ).toBeInTheDocument()
    expect(screen.queryAllByRole('button')).toHaveLength(1)
    expect(clearEvents).not.toHaveBeenCalled()
  })

  it('can clear event log', async () => {
    const eventData = [
      { name: faker.lorem.words(), time: Date.now(), args: [] },
      { name: faker.lorem.words(), time: Date.now() - 5e3, args: [] }
    ]
    events.next(eventData)
    render(html`<${EventsPane} />`)
    expect(clearEvents).not.toHaveBeenCalled()

    await fireEvent.click(screen.queryByRole('button'))
    expect(clearEvents).toHaveBeenCalledTimes(1)
  })
})
