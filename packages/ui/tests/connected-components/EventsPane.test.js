import { fireEvent, render, screen } from '@testing-library/svelte'
import html from 'svelte-htm'
import faker from 'faker'
import { translate } from '../test-utils'
import {
  default as EventsPane,
  isEnabled
} from '../../src/connected-components/EventsPane'
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
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
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
    expect(screen.getByRole('button')).toBeInTheDocument()
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

  it('is disabled when current tool has no events', () => {
    expect(isEnabled({})).toBe(false)
    expect(isEnabled(null, [])).toBe(false)
    expect(isEnabled({ events: [] })).toBe(false)
  })

  it('is enabled when current tool has events, even empty', () => {
    expect(isEnabled({ events: ['test'] })).toBe(true)
  })

  it('is enabled when some events were recorded', () => {
    expect(isEnabled(null, [{}])).toBe(true)
  })
})
