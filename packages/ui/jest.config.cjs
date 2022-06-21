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
    '^.+\\.svelte$': 'jest-transform-svelte',
    '^.+\\.ya?ml$': '<rootDir>/tests/yaml-transformer.js'
  },
  transformIgnorePatterns: ['node_modules\\/(?!htm|svelte-portal)'],
  moduleNameMapper: {
    '^.+\\.(post)?css$': 'identity-obj-proxy'
  },
  setupFilesAfterEnv: ['<rootDir>/tests/jest-setup.js'],
  moduleFileExtensions: ['js', 'svelte'],
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname'
  ],
  coverageDirectory: './coverage',
  collectCoverageFrom: ['<rootDir>/src/**/*.js', '<rootDir>/src/**/*.svelte']
}
