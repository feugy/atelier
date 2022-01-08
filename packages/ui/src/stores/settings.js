import { BehaviorSubject, map } from 'rxjs'

const settings$ = new BehaviorSubject()
reloadSettings()

export function getSettings(key) {
  return settings$.pipe(map(settings => settings?.[key]))
}

export function reloadSettings() {
  settings$.next(window.uiSettings)
}
