import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [svelte()],
  test: {
    // https://github.com/vitest-dev/vitest/issues/2834
    alias: [{ find: /^svelte$/, replacement: 'svelte/internal' }],
    deps: {
      optimizer: {
        web: {
          include: ['svelte-hyperscript']
        }
      }
    },
    environment: 'jsdom'
  }
})
