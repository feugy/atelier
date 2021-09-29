import '@testing-library/jest-dom'
import formatMessage from 'format-message'

const { date, time } = formatMessage.setup().formats
for (const key in date) {
  date[key].timeZone = 'UTC'
}
for (const key in time) {
  time[key].timeZone = 'UTC'
}
