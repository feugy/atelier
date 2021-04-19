import faker from 'faker'
import { get } from 'svelte/store'
import { recordEvent, registerTool, currentTool } from '../src/stores'

describe('stores', () => {
  const postMessage = jest.spyOn(window.parent, 'postMessage')
  const origin = new URL(window.parent.location.href).origin

  beforeEach(jest.resetAllMocks)

  describe('recordEvent()', () => {
    it('records event without data through postMessage', () => {
      const name = faker.lorem.word()
      recordEvent(name)
      expect(postMessage).toHaveBeenCalledWith(
        {
          type: 'recordEvent',
          args: `["${name}"]`
        },
        origin
      )
      expect(postMessage).toHaveBeenCalledTimes(1)
    })
  })

  describe('registerTool()', () => {
    it('sends tool details through postMessage', () => {
      const name = faker.lorem.word()
      registerTool({ name })
      expect(postMessage).toHaveBeenCalledWith(
        {
          type: 'registerTool',
          data: { name }
        },
        origin
      )
      expect(postMessage).toHaveBeenCalledTimes(1)
    })
  })

  describe('currentTool', () => {
    it('is empty by default', () => {
      expect(get(currentTool)).not.toBeDefined()
    })

    it('ignores message from a different origin', () => {
      const data = faker.datatype.uuid()
      expect(get(currentTool)).not.toBeDefined()

      window.dispatchEvent(
        new MessageEvent('message', {
          origin: faker.internet.url(),
          data: { type: 'selectTool', data }
        })
      )
      expect(get(currentTool)).not.toBeDefined()
    })

    it('ignores message with unsupported types', () => {
      const data = faker.datatype.uuid()
      expect(get(currentTool)).not.toBeDefined()

      window.dispatchEvent(
        new MessageEvent('message', {
          origin,
          data: { type: faker.lorem.word(), data }
        })
      )
      expect(get(currentTool)).not.toBeDefined()
    })

    it('updates when receiving selectTool message', () => {
      const data = faker.datatype.uuid()
      expect(get(currentTool)).not.toBeDefined()

      window.dispatchEvent(
        new MessageEvent('message', {
          origin,
          data: { type: 'selectTool', data }
        })
      )
      expect(get(currentTool)).toEqual(data)

      const data2 = faker.datatype.uuid()
      window.dispatchEvent(
        new MessageEvent('message', {
          origin,
          data: { type: 'selectTool', data: data2 }
        })
      )
      expect(get(currentTool)).toEqual(data2)
    })
  })
})
