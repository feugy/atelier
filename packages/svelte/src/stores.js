import { writable, derived } from 'svelte/store'

const main = window.parent

const isJsdom = navigator.userAgent?.includes('jsdom') ?? false

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
    return { type: 'Map', values: format([...arg.entries()]) }
  }
  if (arg instanceof Set) {
    return { type: 'Set', values: format([...arg.keys()]) }
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

function parse(arg) {
  if (Array.isArray(arg)) {
    return arg.map(parse)
  }
  if (arg instanceof Object) {
    if (arg.type === 'Map' && Array.isArray(arg.values)) {
      return new Map(parse(arg.values))
    }
    if (arg.type === 'Set' && Array.isArray(arg.values)) {
      return new Set(parse(arg.values))
    }
    const result = {}
    for (const prop in arg) {
      result[prop] = parse(arg[prop])
    }
    return result
  }
  return arg
}

window.addEventListener('message', ({ origin, data }) => {
  // only accept message from UI workbench, or when running in JSDom (toolshot)
  if (origin === mainOrigin || (isJsdom && origin === '')) {
    if (data.type === 'selectTool') {
      current.set(data.data)
    } else if (data.type === 'updateProperty') {
      const { tool, name, value } = data.data || {}
      updatePropertyByName.get(tool.fullName)?.(name, parse(value))
    }
  }
})

export const currentTool = derived(current, n => n)

export function registerTool(data) {
  updatePropertyByName.set(data.fullName, data.updateProperty)
  postMessage({ type: 'registerTool', data })
}

/**
 * Records a DOM or custom event into the UI.
 * @param {string} name - the event name
 * @param {...any} args - optional argument recorded in the UI
 */
export function recordEvent(name, ...args) {
  postMessage({ type: 'recordEvent', name, args })
}

export function recordVisibility(data) {
  postMessage({ type: 'recordVisibility', data })
}
