const sveltePreprocess = require('svelte-preprocess')
const postcss = require('./postcss.config.js')

// This file is used by
// - @svelte/vite-plugin-svelte
// - "Svelte for VS Code" plugin: it needs to explicitly load postcss.config.js
module.exports = {
  preprocess: [sveltePreprocess({ postcss })]
}
