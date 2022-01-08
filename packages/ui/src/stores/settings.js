import { BehaviorSubject, map, tap } from 'rxjs'
import Ajv from 'ajv'

const ajv = new Ajv()
const settings$ = new BehaviorSubject()
reloadSettings()

export function getSettings(key, schema = {}) {
  const validate = ajv.compile(schema)

  return settings$.pipe(
    map(settings => settings?.[key]),
    tap(value => {
      if (value !== undefined && !validate(value)) {
        throw new Error(
          `Invalid value for "${key}" UI settings:\n${ajv.errorsText(
            validate.errors
          )}`
        )
      }
    })
  )
}

export function reloadSettings() {
  settings$.next(window.uiSettings)
}
