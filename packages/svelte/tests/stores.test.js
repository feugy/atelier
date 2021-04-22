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
          args: [name]
        },
        origin
      )
      expect(postMessage).toHaveBeenCalledTimes(1)
    })

    it('serializes event data', () => {
      const name = faker.lorem.word()
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      })
      recordEvent(name, clickEvent)
      expect(postMessage).toHaveBeenCalledWith(
        {
          type: 'recordEvent',
          args: [
            name,
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
          args: [
            name,
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
          args: [name, [1, 2, 3, 4]]
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
          args: [name, function1.toString(), function2.toString()]
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
          args: [
            name,
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
          args: [
            name,
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

    it('updates tool properties when receiving updateProperty message', () => {
      const tool1 = { name: faker.lorem.word(), updateProperty: jest.fn() }
      registerTool(tool1)

      const tool2 = { name: faker.lorem.word(), updateProperty: jest.fn() }
      registerTool(tool2)

      const update2 = {
        name: faker.lorem.word(),
        value: faker.datatype.number()
      }
      window.dispatchEvent(
        new MessageEvent('message', {
          origin,
          data: {
            type: 'updateProperty',
            data: { tool: tool2.name, ...update2 }
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
        name: faker.lorem.word(),
        value: faker.datatype.number()
      }
      window.dispatchEvent(
        new MessageEvent('message', {
          origin,
          data: {
            type: 'updateProperty',
            data: { tool: tool1.name, ...update1 }
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
      const tool = { name: faker.lorem.word(), updateProperty: jest.fn() }
      registerTool(tool)

      window.dispatchEvent(
        new MessageEvent('message', {
          origin,
          data: {
            type: 'updateProperty',
            data: { tool: faker.lorem.words(), name: 'some-prop', value: 10 }
          }
        })
      )
      expect(tool.updateProperty).not.toHaveBeenCalled()

      window.dispatchEvent(
        new MessageEvent('message', {
          origin,
          data: {
            type: 'updateProperty',
            data: { tool: faker.lorem.words() }
          }
        })
      )
      expect(tool.updateProperty).not.toHaveBeenCalled()
    })

    it('parse Arrays and Objects in property updates', () => {
      const tool = { name: faker.lorem.word(), updateProperty: jest.fn() }
      registerTool(tool)

      const name = faker.lorem.word()
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
            data: { tool: tool.name, name, value }
          }
        })
      )
      expect(tool.updateProperty).toHaveBeenCalledWith(name, value)
      expect(tool.updateProperty).toHaveBeenCalledTimes(1)
    })

    it('parse Maps and Sets in property updates', () => {
      const tool = { name: faker.lorem.word(), updateProperty: jest.fn() }
      registerTool(tool)

      const name = faker.lorem.word()
      window.dispatchEvent(
        new MessageEvent('message', {
          origin,
          data: {
            type: 'updateProperty',
            data: {
              tool: tool.name,
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
