import { BehaviorSubject, Subject, map, scan, shareReplay } from 'rxjs'
import { groupByName } from '../utils'

let workframe = null
let workframeOrigin = null
const tools$ = new BehaviorSubject([])
const current$ = new BehaviorSubject()
const events$ = new BehaviorSubject()
const lastError$ = new Subject()

current$.subscribe(data => {
  postMessage('selectTool', data)
  updateUrl(data?.fullName)
})

window.addEventListener('error', ({ error }) => {
  lastError$.next(error)
})

window.addEventListener('popstate', ({ state }) => {
  if (state?.fullName) {
    for (const tool of tools$.value) {
      if (state.fullName === tool.fullName) {
        current$.next(tool)
        break
      }
    }
  }
})

export const tools = tools$.pipe(map(groupByName))

export const currentTool = current$.asObservable()

export const lastError = lastError$.asObservable()

export const events = events$.pipe(
  // reset log when receiving null
  scan((log, event) => (event ? [event, ...log] : []), []),
  shareReplay(1)
)
// subscribe so we never loose any event
events.subscribe()

export function clearEvents() {
  events$.next(null)
}

export function setWorkbenchFrame(frame) {
  workframe = frame
  workframeOrigin = new URL(workframe.src).origin
  current$.next()
  tools$.next([])
  window.removeEventListener('message', handleMessage)
  window.addEventListener('message', handleMessage)
}

export function selectTool(tool) {
  if (tools$.value.includes(tool)) {
    current$.next(tool)
    clearEvents()
  }
}

export function updateProperty({ detail } = {}) {
  if (current$.value && detail instanceof Object) {
    postMessage('updateProperty', { ...detail, tool: current$.value })
  }
}

function updateUrl(fullName) {
  if (fullName) {
    const url = new URL(window.location)
    url.searchParams.set('tool', fullName)
    window.history.pushState({ fullName }, '', url)
  }
}

function readToolFromUrl() {
  const params = new URLSearchParams(window.location.search)
  return params.get('tool')
}

function handleMessage({ origin, data }) {
  if (origin === workframeOrigin) {
    if (data.type === 'registerTool') {
      registerTool(data.data)
    } else if (data.type === 'removeTool') {
      removeTool(data.data)
    } else if (data.type === 'recordEvent') {
      recordEvent(data)
    } else if (data.type === 'recordError') {
      recordError(data)
    }
  }
}

function recordEvent(data) {
  events$.next({ ...data, time: Date.now() })
}

function recordError({ message, stack }) {
  const error = new Error(message)
  error.stack = stack
  lastError$.next(error)
}

function registerTool(tool) {
  const idx = findInTools(tool.fullName)
  if (idx >= 0) {
    updateInTools(idx, tool)
  } else {
    appendToTools(tool)
  }
  if (
    wasCurrentToolUpdated(tool.fullName) ||
    (!current$.value && doesMatchUrl(tool))
  ) {
    current$.next(tool)
  }
}

function removeTool(fullName) {
  const idx = findInTools(fullName)
  if (idx >= 0) {
    removeInTools(idx)
    if (wasCurrentToolUpdated(fullName)) {
      // todo: Explorer's currentPath can be outdated
      current$.next(tools$.value[0])
    }
  }
}

function postMessage(type, data) {
  if (workframe) {
    workframe.contentWindow?.postMessage({ type, data }, workframeOrigin)
  }
}

function findInTools(fullName) {
  return tools$.value.findIndex(tool => fullName === tool.fullName)
}

function updateInTools(idx, tool) {
  tools$.next([
    ...tools$.value.slice(0, idx),
    tool,
    ...tools$.value.slice(idx + 1)
  ])
}

function appendToTools(tool) {
  tools$.next([...tools$.value, tool])
}

function removeInTools(idx) {
  tools$.next([...tools$.value.slice(0, idx), ...tools$.value.slice(idx + 1)])
}

function wasCurrentToolUpdated(fullName) {
  return current$.value?.fullName === fullName
}

function doesMatchUrl({ fullName }) {
  const urlName = readToolFromUrl()
  return urlName === fullName || !urlName
}
