import matchers from '@testing-library/jest-dom/matchers'
import formatMessage from 'format-message'
import { expect } from 'vitest'

expect.extend(matchers)

const { date, time } = formatMessage.setup().formats
for (const key in date) {
  date[key].timeZone = 'UTC'
}
for (const key in time) {
  time[key].timeZone = 'UTC'
}
