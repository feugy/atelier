module.exports = {
  rootDir: './',
  testMatch: ['<rootDir>/tests/**/*.test.js'],
  testEnvironment: 'node',
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname'
  ],
  coverageDirectory: './coverage',
  collectCoverageFrom: ['<rootDir>/src/**/*.js']
}
