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
  // we'll get rid of this chunk when vite will use a more recent of esbuild
  // https://github.com/vitejs/vite/issues/5833#issuecomment-997971698
  // https://github.com/evanw/esbuild/blob/master/internal/css_parser/css_parser.go#L223
  css: {
    postcss: {
      plugins: [
        {
          postcssPlugin: 'internal:charset-removal',
          AtRule: {
            charset: atRule => {
              if (atRule.name === 'charset') {
                atRule.remove()
              }
            }
          }
        }
      ]
    }
  },
  test: {
    deps: { fallbackCJS: true },
    globals: true,
    environment: 'jsdom',
    setupFiles: 'tests/setup'
  }
})
