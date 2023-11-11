import { faker } from '@faker-js/faker'
import { get } from 'svelte/store'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  currentTool,
  recordError,
  recordEvent,
  recordVisibility,
  registerTool
} from '../src/stores'

function mockExistence(fullName) {
  const element = document.createElement('div')
  element.setAttribute('data-full-name', fullName)
  document.body.append(element)
}

describe('stores', () => {
  const postMessage = vi.spyOn(window.parent, 'postMessage')
  const origin = new URL(window.parent.location.href).origin

  beforeEach(() => vi.resetAllMocks())

  describe('recordVisibility()', () => {
    it('records visibility change through postMessage', () => {
      const name = faker.lorem.word()
      const visible = faker.datatype.boolean()
      recordVisibility({ name, visible })
      expect(postMessage).toHaveBeenCalledWith(
        {
          type: 'recordVisibility',
          data: { name, visible }
        },
        origin
      )
      expect(postMessage).toHaveBeenCalledTimes(1)
    })
  })

  describe('recordError()', () => {
    it('serializes error message and stack trace', () => {
      const message = faker.lorem.word()
      const error = new Error(message)
      recordError(error)
      expect(postMessage).toHaveBeenCalledWith(
        {
          type: 'recordError',
          message,
          stack: expect.any(String)
        },
        origin
      )
      expect(postMessage).toHaveBeenCalledTimes(1)
    })
  })

  describe('recordEvent()', () => {
    it('records event without data through postMessage', () => {
      const name = faker.lorem.word()
      recordEvent(name)
      expect(postMessage).toHaveBeenCalledWith(
        {
          type: 'recordEvent',
          name,
          args: []
        },
        origin
      )
      expect(postMessage).toHaveBeenCalledTimes(1)
    })

    it('serializes event data', () => {
      const name = faker.lorem.word()
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true
      })
      recordEvent(name, clickEvent)
      expect(postMessage).toHaveBeenCalledWith(
        {
          type: 'recordEvent',
          name,
          args: [
            {
              altKey: false,
              button: 0,
              buttons: 0,
              cancelable: clickEvent.cancelable,
              clientX: 0,
              clientY: 0,
              ctrlKey: false,
              currentTarget: null,
              defaultPrevented: false,
              detail: 0,
              metaKey: false,
              offsetX: 0,
              offsetY: 0,
              pageX: 0,
              pageY: 0,
              relatedTarget: null,
              screenX: 0,
              screenY: 0,
              shiftKey: false,
              target: null,
              type: clickEvent.type,
              which: 0
            }
          ]
        },
        origin
      )

      const customEvent = new CustomEvent('select', {
        detail: { foo: faker.lorem.words() }
      })
      recordEvent(name, customEvent)
      expect(postMessage).toHaveBeenCalledWith(
        {
          type: 'recordEvent',
          name,
          args: [
            {
              cancelable: false,
              currentTarget: null,
              defaultPrevented: false,
              detail: customEvent.detail,
              target: null,
              type: customEvent.type
            }
          ]
        },
        origin
      )
      expect(postMessage).toHaveBeenCalledTimes(2)
    })

    it('serializes function and arrays', () => {
      const name = faker.lorem.word()
      recordEvent(name, [1, 2, 3, 4])
      expect(postMessage).toHaveBeenCalledWith(
        {
          type: 'recordEvent',
          name,
          args: [[1, 2, 3, 4]]
        },
        origin
      )

      function function1() {
        return 'oh yeah '
      }
      const function2 = () => 'aw yeah!'

      recordEvent(name, function1, function2)
      expect(postMessage).toHaveBeenCalledWith(
        {
          type: 'recordEvent',
          name,
          args: [function1.toString(), function2.toString()]
        },
        origin
      )
      expect(postMessage).toHaveBeenCalledTimes(2)
    })

    it('serializes Sets and Maps', () => {
      const name = faker.lorem.word()
      recordEvent(name, new Set(['a', 'b', new Set(['c'])]))
      expect(postMessage).toHaveBeenCalledWith(
        {
          type: 'recordEvent',
          name,
          args: [
            { type: 'Set', values: ['a', 'b', { type: 'Set', values: ['c'] }] }
          ]
        },
        origin
      )

      recordEvent(
        name,
        new Map([
          ['a', 1],
          ['b', new Map([['d', 2]])],
          ['c', 3]
        ])
      )
      expect(postMessage).toHaveBeenCalledWith(
        {
          type: 'recordEvent',
          name,
          args: [
            {
              type: 'Map',
              values: [
                ['a', 1],
                ['b', { type: 'Map', values: [['d', 2]] }],
                ['c', 3]
              ]
            }
          ]
        },
        origin
      )
      expect(postMessage).toHaveBeenCalledTimes(2)
    })
  })

  describe('registerTool()', () => {
    // clean tools
    afterEach(() => registerTool())

    it('sends tool details through postMessage', () => {
      const fullName = `${faker.lorem.word()}-1`
      registerTool({ fullName })
      expect(postMessage).toHaveBeenCalledWith(
        {
          type: 'registerTool',
          data: { fullName }
        },
        origin
      )
      expect(postMessage).toHaveBeenCalledTimes(1)
    })

    it('updates tool properties when receiving updateProperty message', () => {
      const tool1 = {
        fullName: `${faker.lorem.word()}-2`,
        updateProperty: vi.fn()
      }
      registerTool(tool1)
      mockExistence(tool1.fullName)

      const tool2 = {
        fullName: `${faker.lorem.word()}-3`,
        updateProperty: vi.fn()
      }
      registerTool(tool2)
      mockExistence(tool2.fullName)

      const update2 = {
        name: `${faker.lorem.word()}-4`,
        value: faker.number.int(999)
      }
      window.dispatchEvent(
        new MessageEvent('message', {
          origin,
          data: {
            type: 'updateProperty',
            data: { tool: tool2, ...update2 }
          }
        })
      )
      expect(tool2.updateProperty).toHaveBeenCalledWith(
        update2.name,
        update2.value
      )
      expect(tool2.updateProperty).toHaveBeenCalledTimes(1)
      expect(tool1.updateProperty).not.toHaveBeenCalled()
      tool2.updateProperty.mockReset()

      const update1 = {
        name: `${faker.lorem.word()}-5`,
        value: faker.number.int(999)
      }
      window.dispatchEvent(
        new MessageEvent('message', {
          origin,
          data: {
            type: 'updateProperty',
            data: { tool: tool1, ...update1 }
          }
        })
      )
      expect(tool1.updateProperty).toHaveBeenCalledWith(
        update1.name,
        update1.value
      )
      expect(tool1.updateProperty).toHaveBeenCalledTimes(1)
      expect(tool2.updateProperty).not.toHaveBeenCalled()
    })

    it('does not update tool properties when receiving updateProperty message of unknown tool', () => {
      const tool = {
        fullName: `${faker.lorem.word()}-6`,
        updateProperty: vi.fn()
      }
      registerTool(tool)

      window.dispatchEvent(
        new MessageEvent('message', {
          origin,
          data: {
            type: 'updateProperty',
            data: {
              tool: { fullName: `${faker.lorem.word()}-7` },
              name: 'some-prop',
              value: 10
            }
          }
        })
      )
      expect(tool.updateProperty).not.toHaveBeenCalled()

      window.dispatchEvent(
        new MessageEvent('message', {
          origin,
          data: {
            type: 'updateProperty',
            data: { tool: { fullName: `${faker.lorem.word()}-8` } }
          }
        })
      )
      expect(tool.updateProperty).not.toHaveBeenCalled()
    })

    it('parse Arrays and Objects in property updates', () => {
      const tool = {
        fullName: `${faker.lorem.word()}-9`,
        updateProperty: vi.fn()
      }
      registerTool(tool)

      const name = `${faker.lorem.word()}-10`
      const value = {
        a: 1,
        b: [1, 2, { d: 4, e: 5 }],
        c: 3
      }
      window.dispatchEvent(
        new MessageEvent('message', {
          origin,
          data: {
            type: 'updateProperty',
            data: { tool: tool, name, value }
          }
        })
      )
      expect(tool.updateProperty).toHaveBeenCalledWith(name, value)
      expect(tool.updateProperty).toHaveBeenCalledTimes(1)
    })

    it('parse Maps and Sets in property updates', () => {
      const tool = {
        fullName: `${faker.lorem.word()}-11`,
        updateProperty: vi.fn()
      }
      registerTool(tool)

      const name = `${faker.lorem.word()}-12`
      window.dispatchEvent(
        new MessageEvent('message', {
          origin,
          data: {
            type: 'updateProperty',
            data: {
              tool: tool,
              name,
              value: {
                type: 'Map',
                values: [
                  ['a', 1],
                  [
                    'b',
                    {
                      type: 'Set',
                      values: [
                        1,
                        2,
                        {
                          type: 'Map',
                          values: [
                            ['d', 4],
                            ['e', 5]
                          ]
                        }
                      ]
                    }
                  ],
                  ['c', 3]
                ]
              }
            }
          }
        })
      )
      expect(tool.updateProperty).toHaveBeenCalledWith(
        name,
        new Map([
          ['a', 1],
          [
            'b',
            new Set([
              1,
              2,
              new Map([
                ['d', 4],
                ['e', 5]
              ])
            ])
          ],
          ['c', 3]
        ])
      )
      expect(tool.updateProperty).toHaveBeenCalledTimes(1)
    })

    it('sends tool removal if it can not be found in DOM', () => {
      const tool1 = `${faker.lorem.word()}-13`
      const tool2 = `${faker.lorem.word()}-14`
      const tool3 = `${faker.lorem.word()}-15`

      registerTool({ fullName: tool1 })
      postMessage.mockReset()

      registerTool({ fullName: tool2 })
      mockExistence(tool2)
      expect(postMessage).toHaveBeenCalledWith(
        {
          type: 'removeTool',
          data: tool1
        },
        origin
      )
      expect(postMessage).toHaveBeenCalledWith(
        {
          type: 'registerTool',
          data: { fullName: tool2 }
        },
        origin
      )
      expect(postMessage).toHaveBeenCalledTimes(2)
      postMessage.mockReset()

      registerTool({ fullName: tool3 })
      expect(postMessage).toHaveBeenCalledWith(
        {
          type: 'registerTool',
          data: { fullName: tool3 }
        },
        origin
      )
      expect(postMessage).toHaveBeenCalledTimes(1)
    })
  })

  describe('currentTool', () => {
    it('is empty by default', () => {
      expect(get(currentTool)).toBeUndefined()
    })

    it('ignores message from a different origin', () => {
      const data = faker.string.uuid()
      expect(get(currentTool)).toBeUndefined()

      window.dispatchEvent(
        new MessageEvent('message', {
          origin: faker.internet.url({ appendSlash: false }),
          data: { type: 'selectTool', data }
        })
      )
      expect(get(currentTool)).toBeUndefined()
    })

    it('ignores message with unsupported types', () => {
      const data = faker.string.uuid()
      expect(get(currentTool)).toBeUndefined()

      window.dispatchEvent(
        new MessageEvent('message', {
          origin,
          data: { type: faker.lorem.word(), data }
        })
      )
      expect(get(currentTool)).toBeUndefined()
    })

    it('updates when receiving selectTool message', () => {
      const data = faker.string.uuid()
      expect(get(currentTool)).toBeUndefined()

      window.dispatchEvent(
        new MessageEvent('message', {
          origin,
          data: { type: 'selectTool', data }
        })
      )
      expect(get(currentTool)).toEqual(data)

      const data2 = faker.string.uuid()
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
