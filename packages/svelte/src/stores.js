import { writable, derived } from 'svelte/store'

const main = window.parent

let mainOrigin = null

// a mix of properties from Event, UIEvent, MouseEvent, TouchEvent, KeyboardEvent, WheelEvent, InputEvent
const eventProps = [
  'altKey',
  'bubble',
  'button',
  'buttons',
  'cancelable',
  'clientX',
  'clientY',
  'code',
  'ctrlKey',
  'currentTarget',
  'data',
  'dataTransfer',
  'defaultPrevented',
  'deltaX',
  'deltaY',
  'deltaZ',
  'deltaMode',
  'detail',
  'inputType',
  'key',
  'layerX',
  'layerY',
  'metaKey',
  'movementX',
  'movementY',
  'offsetX',
  'offsetY',
  'pageX',
  'pageY',
  'relatedTarget',
  'repeat',
  'screenX',
  'screenY',
  'shiftKey',
  'target',
  'touches',
  'type',
  'which'
]

const updatePropertyByName = new Map()

const current = new writable()

function postMessage(message) {
  if (main) {
    if (!mainOrigin) {
      mainOrigin = new URL(parent.location.href).origin
    }
    main.postMessage(format(message), mainOrigin)
  }
}

function format(arg) {
  if (Array.isArray(arg)) {
    return arg.map(format)
  }
  if (arg instanceof Map) {
    return { type: 'Map', values: [...arg.entries()] }
  }
  if (arg instanceof Set) {
    return { type: 'Set', values: [...arg.keys()] }
  }
  if (arg instanceof Function) {
    return arg.toString()
  }
  if (arg instanceof Event || arg instanceof Object) {
    const result = {}
    const props = arg instanceof Event ? eventProps : Object.keys(arg)
    for (const prop of props) {
      if (prop in arg) {
        result[prop] = format(arg[prop])
      }
    }
    return result
  }
  return arg
}

window.addEventListener('message', ({ origin, data }) => {
  if (origin === mainOrigin) {
    if (data.type === 'selectTool') {
      current.set(data.data)
    } else if (data.type === 'updateProperty') {
      const { tool, name, value } = data.data || {}
      updatePropertyByName.get(tool)?.(name, value)
    }
  }
})

export const currentTool = derived(current, n => n)

export function registerTool(data) {
  updatePropertyByName.set(data.name, data.updateProperty)
  postMessage({ type: 'registerTool', data })
}

export function recordEvent(...args) {
  postMessage({ type: 'recordEvent', args })
}
