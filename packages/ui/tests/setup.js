import 'vitest-dom/extend-expect'

import { cleanup } from '@testing-library/svelte'
import formatMessage from 'format-message'
import { afterEach } from 'vitest'

const { date, time } = formatMessage.setup().formats
for (const key in date) {
  date[key].timeZone = 'UTC'
}
for (const key in time) {
  time[key].timeZone = 'UTC'
}

afterEach(() => cleanup())
