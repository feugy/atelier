import { svelte } from '@sveltejs/vite-plugin-svelte'
import yaml from '@rollup/plugin-yaml'
import atelier from '@atelier-wb/vite-plugin-atelier'
import { defineConfig } from 'vite'
import windi from 'vite-plugin-windicss'

export default defineConfig({
  base: '', // allows embedded deployments
  plugins: [
    windi(),
    svelte(),
    yaml(),
    atelier({
      path: './tests',
      setupPath: './atelier-setup.js',
      bundled: false
    })
  ],
  build: {
    rollupOptions: {
      external: ['./ui-settings.js']
    }
  },
  server: {
    port: 3001,
    open: '/atelier',
    fs: { strict: false }
  },
  test: {
    deps: { fallbackCJS: true },
    globals: true,
    environment: 'jsdom',
    setupFiles: 'tests/setup'
  }
})
