import yaml from '@rollup/plugin-yaml'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import sveltePreprocess from 'svelte-preprocess'
import { defineConfig } from 'vite'
import windi from 'vite-plugin-windicss'

import atelier from '../vite-plugin-atelier'

export default defineConfig(({ mode }) => {
  return {
    base: '', // allows embedded deployments
    plugins: [
      windi({
        transformCSS: 'pre'
      }),
      svelte({
        emitCss: mode !== 'test',
        preprocess: [sveltePreprocess()]
      }),
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
      // https://github.com/vitest-dev/vitest/issues/2834
      alias: [{ find: /^svelte$/, replacement: 'svelte/internal' }],
      deps: {
        optimizer: {
          web: {
            include: ['svelte-hyperscript']
          }
        }
      },
      environment: 'jsdom',
      setupFiles: 'tests/setup'
    }
  }
})
