module.exports = {
  rootDir: './',
  testMatch: ['<rootDir>/tests/**/*.test.js'],
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.js$': [
      'babel-jest',
      {
        presets: [['@babel/preset-env', { targets: { node: 'current' } }]]
      }
    ],
    '^.+\\.svelte$': 'jest-transform-svelte'
  },
  setupFilesAfterEnv: ['<rootDir>/tests/jest-setup.js'],
  moduleFileExtensions: ['js', 'svelte'],
  transformIgnorePatterns: ['node_modules\\/(?!htm)'],
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname'
  ],
  coverageDirectory: './coverage',
  collectCoverageFrom: [
    '<rootDir>/*.cjs',
    '<rootDir>/src/**/*.js',
    '<rootDir>/src/**/*.svelte'
  ]
}
