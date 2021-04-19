import { writable, derived } from 'svelte/store'

const main = window.parent
let mainOrigin = null

const current = new writable()

export const currentTool = derived(current, n => n)

function postMessage(message) {
  if (main) {
    if (!mainOrigin) {
      mainOrigin = new URL(parent.location.href).origin
    }
    main.postMessage(message, mainOrigin)
  }
}

window.addEventListener('message', ({ origin, data }) => {
  if (origin === mainOrigin) {
    if (data.type === 'selectTool') {
      current.set(data.data)
    }
  }
})

export function registerTool(data) {
  postMessage({ type: 'registerTool', data })
}

export function recordEvent(...args) {
  postMessage({ type: 'recordEvent', args: JSON.stringify(args) })
}
