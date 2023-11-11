import atelier from '@atelier-wb/vite-plugin-atelier'
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [atelier(), sveltekit()]
})
