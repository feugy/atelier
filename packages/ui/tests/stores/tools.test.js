import faker from 'faker'
import { get } from 'svelte/store'
import {
  clearEvents,
  workbenchDim,
  events,
  toolsMap,
  currentTool,
  selectTool,
  setWorkbenchFrame,
  updateProperty
} from '../../src/stores'

describe('tools store', () => {
  const subscriptions = []

  beforeEach(jest.resetAllMocks)

  afterEach(() => {
    for (const subscription of subscriptions) {
      subscription.unsubscribe()
    }
    subscriptions.splice(0, subscriptions.length)
  })

  it('ignores frame messages with wrong origin', () => {
    const src = faker.internet.url()
    setWorkbenchFrame({ src })
    window.dispatchEvent(
      new MessageEvent('message', {
        origin: faker.internet.url(),
        data: { type: 'registerTool', data: {} }
      })
    )
    expect(get(currentTool)).not.toBeDefined()
    expect(get(toolsMap)).toEqual(new Map())
    expect(get(events)).toEqual([])
  })

  it('ignores unsupported frame messages', () => {
    const src = faker.internet.url()
    setWorkbenchFrame({ src })
    window.dispatchEvent(
      new MessageEvent('message', {
        origin: src,
        data: { type: faker.lorem.word(), data: {} }
      })
    )
    expect(get(currentTool)).not.toBeDefined()
    expect(get(toolsMap)).toEqual(new Map())
    expect(get(events)).toEqual([])
  })

  it('registers new tools', () => {
    const src = faker.internet.url()
    const tool1 = { fullName: faker.commerce.productName() }
    const tool2 = { fullName: faker.commerce.productName() }
    const tool3 = { fullName: faker.commerce.productName() }
    setWorkbenchFrame({ src })
    expect(get(currentTool)).not.toBeDefined()

    window.dispatchEvent(
      new MessageEvent('message', {
        origin: src,
        data: { type: 'registerTool', data: tool1 }
      })
    )
    expect(get(currentTool)).toEqual(tool1)
    expect(get(toolsMap)).toEqual(new Map([[tool1.fullName, tool1]]))

    window.dispatchEvent(
      new MessageEvent('message', {
        origin: src,
        data: { type: 'registerTool', data: tool2 }
      })
    )
    expect(get(currentTool)).toEqual(tool1)
    expect(get(toolsMap)).toEqual(
      new Map([
        [tool1.fullName, tool1],
        [tool2.fullName, tool2]
      ])
    )

    window.dispatchEvent(
      new MessageEvent('message', {
        origin: src,
        data: { type: 'registerTool', data: tool3 }
      })
    )
    expect(get(currentTool)).toEqual(tool1)
    expect(get(toolsMap)).toEqual(
      new Map([
        [tool1.fullName, tool1],
        [tool2.fullName, tool2],
        [tool3.fullName, tool3]
      ])
    )
    expect(new URLSearchParams(location.search).get('tool')).toEqual(
      tool1.fullName
    )
  })

  it('accumulates events', () => {
    const event1 = { name: 'click', args: [{ text: faker.lorem.words() }] }
    const event2 = { name: 'input', args: [{ text: faker.lorem.words() }] }
    const event3 = { name: 'select', args: [{ text: faker.lorem.words() }] }

    let eventLog = []
    subscriptions.push(events.subscribe(value => (eventLog = value)))

    const src = faker.internet.url()
    setWorkbenchFrame({ src })
    window.dispatchEvent(
      new MessageEvent('message', {
        origin: src,
        data: { type: 'recordEvent', ...event1 }
      })
    )
    expect(eventLog).toEqual([
      { ...event1, type: 'recordEvent', time: expect.any(Number) }
    ])

    window.dispatchEvent(
      new MessageEvent('message', {
        origin: src,
        data: { type: 'recordEvent', ...event2 }
      })
    )
    expect(eventLog).toEqual([
      { ...event2, type: 'recordEvent', time: expect.any(Number) },
      { ...event1, type: 'recordEvent', time: expect.any(Number) }
    ])

    window.dispatchEvent(
      new MessageEvent('message', {
        origin: src,
        data: { type: 'recordEvent', ...event3 }
      })
    )
    expect(eventLog).toEqual([
      { ...event3, type: 'recordEvent', time: expect.any(Number) },
      { ...event2, type: 'recordEvent', time: expect.any(Number) },
      { ...event1, type: 'recordEvent', time: expect.any(Number) }
    ])
  })

  it('can clear accumulated events', () => {
    const event1 = { name: 'click', args: [{ text: faker.lorem.words() }] }
    const event2 = { name: 'input', args: [{ text: faker.lorem.words() }] }

    let eventLog = []
    subscriptions.push(events.subscribe(value => (eventLog = value)))

    const src = faker.internet.url()
    setWorkbenchFrame({ src })
    window.dispatchEvent(
      new MessageEvent('message', {
        origin: src,
        data: { type: 'recordEvent', ...event1 }
      })
    )
    window.dispatchEvent(
      new MessageEvent('message', {
        origin: src,
        data: { type: 'recordEvent', ...event2 }
      })
    )
    expect(eventLog).toEqual(
      expect.arrayContaining([
        { ...event2, type: 'recordEvent', time: expect.any(Number) },
        { ...event1, type: 'recordEvent', time: expect.any(Number) }
      ])
    )

    clearEvents()
    expect(eventLog).toEqual([])
  })

  it('does not send properties updates without current tool', () => {
    const name = faker.lorem.words()
    const value = faker.datatype.number()
    const postMessage = jest.fn()

    const src = faker.internet.url()
    setWorkbenchFrame({ src, contentWindow: { postMessage } })
    postMessage.mockReset()

    updateProperty({ detail: { name, value } })
    expect(postMessage).not.toHaveBeenCalled()
  })

  describe('given some registered tools', () => {
    const postMessage = jest.fn()
    const src = faker.internet.url()
    const tool1 = { fullName: faker.commerce.productName() }
    const tool2 = { fullName: faker.commerce.productName() }
    const tool3 = { fullName: faker.commerce.productName() }

    beforeEach(() => {
      window.history.pushState({}, '', 'http://localhost')
      setWorkbenchFrame({ src, contentWindow: { postMessage } })
      window.dispatchEvent(
        new MessageEvent('message', {
          origin: src,
          data: { type: 'registerTool', data: tool1 }
        })
      )
      window.dispatchEvent(
        new MessageEvent('message', {
          origin: src,
          data: { type: 'registerTool', data: tool2 }
        })
      )
      window.dispatchEvent(
        new MessageEvent('message', {
          origin: src,
          data: { type: 'registerTool', data: tool3 }
        })
      )
      postMessage.mockReset()
    })

    it('registers existing tools', () => {
      const updatedTool2 = { ...tool2, count: 1 }
      window.dispatchEvent(
        new MessageEvent('message', {
          origin: src,
          data: { type: 'registerTool', data: updatedTool2 }
        })
      )
      expect(get(currentTool)).toEqual(tool1)
      expect(get(toolsMap)).toEqual(
        new Map([
          [tool1.fullName, tool1],
          [tool2.fullName, updatedTool2],
          [tool3.fullName, tool3]
        ])
      )

      const updatedTool1 = { ...tool1, count: 1 }
      window.dispatchEvent(
        new MessageEvent('message', {
          origin: src,
          data: { type: 'registerTool', data: updatedTool1 }
        })
      )
      expect(get(currentTool)).toEqual(updatedTool1)
      expect(get(toolsMap)).toEqual(
        new Map([
          [tool1.fullName, updatedTool1],
          [tool2.fullName, updatedTool2],
          [tool3.fullName, tool3]
        ])
      )
    })

    it('send newly selected tool to the frame and location', () => {
      expect(get(currentTool)).toEqual(tool1)

      selectTool(tool3)
      expect(get(currentTool)).toEqual(tool3)
      expect(postMessage).toHaveBeenCalledWith(
        { type: 'selectTool', data: tool3 },
        src
      )
      expect(postMessage).toHaveBeenCalledTimes(1)
      expect(new URLSearchParams(location.search).get('tool')).toEqual(
        tool3.fullName
      )
    })

    it('can not select unknown tool', () => {
      expect(get(currentTool)).toEqual(tool1)

      selectTool({ fullName: faker.commerce.productName() })
      expect(get(currentTool)).toEqual(tool1)
      expect(postMessage).not.toHaveBeenCalled()
      expect(new URLSearchParams(location.search).get('tool')).toEqual(
        tool1.fullName
      )
    })

    it('updates selection when going back in history', async () => {
      expect(get(currentTool)).toEqual(tool1)

      selectTool(tool2)
      expect(get(currentTool)).toEqual(tool2)
      expect(postMessage).toHaveBeenCalledWith(
        { type: 'selectTool', data: tool2 },
        src
      )
      expect(postMessage).toHaveBeenCalledTimes(1)
      expect(new URLSearchParams(location.search).get('tool')).toEqual(
        tool2.fullName
      )
      postMessage.mockReset()

      window.dispatchEvent(new PopStateEvent('popstate', { state: tool1 }))
      await Promise.resolve()
      expect(postMessage).toHaveBeenCalledWith(
        { type: 'selectTool', data: tool1 },
        src
      )
      expect(postMessage).toHaveBeenCalledTimes(1)
      expect(new URLSearchParams(location.search).get('tool')).toEqual(
        tool1.fullName
      )
    })

    it('ignores history changes without valid states', async () => {
      expect(get(currentTool)).toEqual(tool1)

      selectTool(tool2)
      expect(get(currentTool)).toEqual(tool2)
      expect(postMessage).toHaveBeenCalledWith(
        { type: 'selectTool', data: tool2 },
        src
      )
      expect(postMessage).toHaveBeenCalledTimes(1)
      expect(new URLSearchParams(location.search).get('tool')).toEqual(
        tool2.fullName
      )
      postMessage.mockReset()

      window.dispatchEvent(new PopStateEvent('popstate', {}))
      await Promise.resolve()
      expect(postMessage).not.toHaveBeenCalled()

      window.dispatchEvent(
        new PopStateEvent('popstate', {
          state: { fullName: faker.commerce.productName() }
        })
      )
      await Promise.resolve()
      expect(postMessage).not.toHaveBeenCalled()

      expect(new URLSearchParams(location.search).get('tool')).toEqual(
        tool2.fullName
      )
    })

    it('sends properties updates on current tool', () => {
      const name = faker.lorem.words()
      const value = faker.datatype.number()

      updateProperty({ detail: { name, value } })
      expect(postMessage).toHaveBeenCalledWith(
        { type: 'updateProperty', data: { name, value, tool: tool1 } },
        src
      )
      expect(postMessage).toHaveBeenCalledTimes(1)
    })

    it('updates workbench dimensions from visible tool', () => {
      const height = faker.datatype.number()
      const width = faker.datatype.number()
      expect(get(workbenchDim)).toBeNull()

      window.dispatchEvent(
        new MessageEvent('message', {
          origin: src,
          data: {
            type: 'recordVisibility',
            data: { visible: false, width, height }
          }
        })
      )
      expect(get(workbenchDim)).toBeNull()

      window.dispatchEvent(
        new MessageEvent('message', {
          origin: src,
          data: {
            type: 'recordVisibility',
            data: { visible: true, width, height }
          }
        })
      )
      expect(get(workbenchDim)).toEqual({ width, height })
    })
  })
})
