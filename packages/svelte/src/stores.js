import { writable, derived } from 'svelte/store'

const isJsdom = navigator.userAgent?.includes('jsdom') ?? false

let mainOrigin = null

const updatePropertyByName = new Map()

const current = new writable()

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
  checkToolsExistence()
  if (data) {
    updatePropertyByName.set(data.fullName, data.updateProperty)
    postMessage({ type: 'registerTool', data })
  }
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

export function recordError(error) {
  postMessage({
    type: 'recordError',
    message: error.message,
    stack: error.stack
  })
}

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

function doesLiveInDOM(fullName) {
  return Boolean(
    document.querySelector(`[data-full-name='${encodeURIComponent(fullName)}']`)
  )
}

function checkToolsExistence() {
  for (const fullName of [...updatePropertyByName.keys()]) {
    if (!doesLiveInDOM(fullName)) {
      postMessage({ type: 'removeTool', data: fullName })
      updatePropertyByName.delete(fullName)
    }
  }
}

function postMessage(message) {
  if (window.parent) {
    if (!mainOrigin) {
      mainOrigin = new URL(parent.location.href).origin
    }
    window.parent.postMessage(format(message), mainOrigin)
  }
}

function format(arg) {
  if (Array.isArray(arg)) {
    return formatArray(arg)
  }
  if (arg instanceof Map) {
    return formatMap(arg)
  }
  if (arg instanceof Set) {
    return formatSet(arg)
  }
  if (arg instanceof Function) {
    return formatFunction(arg)
  }
  if (arg instanceof Event) {
    return formatEvent(arg)
  }
  if (arg instanceof Object) {
    return formatObject(arg)
  }
  return arg
}

function formatArray(array) {
  return array.map(format)
}

function formatMap(map) {
  return { type: 'Map', values: format([...map.entries()]) }
}

function formatSet(set) {
  return { type: 'Set', values: format([...set.keys()]) }
}

function formatFunction(func) {
  return func.toString()
}

function formatEvent(event) {
  const result = {}
  for (const prop of eventProps) {
    if (prop in event) {
      result[prop] = format(event[prop])
    }
  }
  return result
}

function formatObject(object) {
  const result = {}
  for (const prop of Object.keys(object)) {
    result[prop] = format(object[prop])
  }
  return result
}

function parse(arg) {
  if (Array.isArray(arg)) {
    return parseArray(arg)
  }
  if (arg instanceof Object) {
    if (arg.type === 'Map' && Array.isArray(arg.values)) {
      return parseMap(arg)
    }
    if (arg.type === 'Set' && Array.isArray(arg.values)) {
      return parseSet(arg)
    }
    return parseObject(arg)
  }
  return arg
}

function parseArray(array) {
  return array.map(parse)
}

function parseMap(map) {
  return new Map(parse(map.values))
}

function parseSet(set) {
  return new Set(parse(set.values))
}

function parseObject(object) {
  const result = {}
  for (const prop in object) {
    result[prop] = parse(object[prop])
  }
  return result
}
