import { BehaviorSubject } from 'rxjs'
import { map, scan, tap } from 'rxjs/operators'
import { groupByName } from '../utils'

let workbench = null
let workbenchOrigin = null

function updateUrl(name) {
  const url = new URL(window.location)
  url.searchParams.set('tool', name)
  window.history.pushState({ name }, '', url)
}

function readToolFromUrl() {
  const params = new URLSearchParams(window.location.search)
  return params.get('tool')
}

export function setWorkbenchFrame(frame) {
  workbench = frame
  workbenchOrigin = new URL(workbench.src).origin
  window.addEventListener('message', ({ origin, data }) => {
    if (origin === workbenchOrigin) {
      if (data.type === 'registerTool') {
        registerTool(data.data)
      } else if (data.type === 'recordEvent') {
        const [name, ...args] = data.args
        events$.next({ name, args, time: Date.now() })
      }
    }
  })
}

const tools$ = new BehaviorSubject([])

export const toolsMap = tools$.pipe(map(groupByName))

const current$ = new BehaviorSubject()

current$.subscribe(data => {
  if (workbench) {
    workbench.contentWindow?.postMessage(
      { type: 'selectTool', data },
      workbenchOrigin
    )
  }
})

window.addEventListener('popstate', ({ state }) => {
  if (state?.name) {
    for (const tool of tools$.value) {
      if (state.name === tool.name) {
        current$.next(tool)
        break
      }
    }
  }
})

export const currentTool = current$.asObservable()

function registerTool(tool) {
  const { value: list } = tools$

  const idx = list.findIndex(({ name }) => name === tool.name)

  tools$.next([
    ...(idx === -1 ? list : [...list.slice(0, idx), ...list.slice(idx + 1)]),
    tool
  ])

  // the current tool has been updated, or there are no current tool, but an url match
  const urlName = readToolFromUrl()
  if (
    (idx >= 0 && current$.value === list[idx]) ||
    (!current$.value && (urlName === tool.name || !urlName))
  ) {
    current$.next(tool)
  }
}

const events$ = new BehaviorSubject()

export const events = events$.pipe(
  // reset log when receiving null
  tap(n => console.log(n)),
  scan((log, event) => (event ? [event, ...log] : []), [])
)

export function selectTool(tool) {
  if (tools$.value.includes(tool)) {
    updateUrl(tool.name)
    current$.next(tool)
    events$.next(null)
  }
}
