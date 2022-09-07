import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [svelte()],
  test: {
    deps: { fallbackCJS: true },
    globals: true,
    environment: 'jsdom',
    setupFiles: 'tests/setup'
  }
})
