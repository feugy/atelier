import { BehaviorSubject } from 'rxjs'
import { map, scan, shareReplay } from 'rxjs/operators'
import { groupByName } from '../utils'

let workframe = null
let workframeOrigin = null
const tools$ = new BehaviorSubject([])
const current$ = new BehaviorSubject()
const events$ = new BehaviorSubject()

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
    } else if (data.type === 'recordEvent') {
      const [name, ...args] = data.args
      events$.next({ name, args, time: Date.now() })
    }
  }
}

function registerTool(tool) {
  const { value: list } = tools$

  const idx = list.findIndex(({ fullName }) => fullName === tool.fullName)

  tools$.next([
    ...(idx === -1 ? list : [...list.slice(0, idx), ...list.slice(idx + 1)]),
    tool
  ])

  // the current tool has been updated, or there are no current tool, but an url match
  const urlName = readToolFromUrl()
  if (
    (idx >= 0 && current$.value === list[idx]) ||
    (!current$.value && (urlName === tool.fullName || !urlName))
  ) {
    current$.next(tool)
  }
}

function postMessage(type, data) {
  if (workframe) {
    workframe.contentWindow?.postMessage({ type, data }, workframeOrigin)
  }
}

current$.subscribe(data => {
  postMessage('selectTool', data)
  updateUrl(data?.fullName)
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

export const toolsMap = tools$.pipe(map(groupByName))

export const currentTool = current$.asObservable()

export const events = events$.pipe(
  // reset log when receiving null
  scan((log, event) => (event ? [event, ...log] : []), []),
  shareReplay(1)
)
// subscribe so we never loose any event
events.subscribe()

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

export function clearEvents() {
  events$.next(null)
}
