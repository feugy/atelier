module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:svelte/recommended',
    'plugin:vitest/recommended',
    'plugin:testing-library/dom'
  ],
  env: {
    browser: true,
    es2020: true,
    node: true
  },
  plugins: ['simple-import-sort'],
  parserOptions: {
    sourceType: 'module'
  },
  rules: {
    'simple-import-sort/imports': 'error',
    'vitest/valid-expect': 'off',
    'testing-library/no-node-access': 'off'
  }
}
