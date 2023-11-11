import atelier from '@atelier-wb/vite-plugin-atelier'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [svelte(), atelier()]
})
