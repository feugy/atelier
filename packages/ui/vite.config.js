import { resolve } from 'path'
import { defineConfig } from 'vite'
import svelte from '@sveltejs/vite-plugin-svelte'
import yaml from '@rollup/plugin-yaml'
import atelier from '@atelier/vite-plugin-svelte'

export default defineConfig({
  base: '', // allows embedded deployments
  plugins: [
    svelte(),
    yaml(),
    atelier({
      path: resolve(__dirname, 'tests'),
      setupPath: resolve(__dirname, 'tests', 'atelier-setup.js'),
      bundled: false
    })
  ],
  server: {
    port: 3001,
    open: true
  }
})
