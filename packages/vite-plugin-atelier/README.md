# Atelier - Vite Plugin

[![](https://img.shields.io/npm/v/@atelier-wb/vite-plugin-atelier.svg)](https://www.npmjs.com/package/@atelier-wb/vite-plugin-atelier)

Weclome to the Atelier!

This [Vite][vite] plugin launches atelier as part of your dev server.

---

- [Getting started](#getting-started)
- [Configuration API](#configuration-api)

---

## Getting started

You'll need first to write some "tools" files for your UI components.

Please refer to your UI framework binding API:

- [for svelte][svelte-bindings]

Then, assuming you already [installed vite and configured it][vite-getting-started],

1. install the plugin for Vite and your UI framework bindings,

   ```shell
   npm i -D @atelier-wb/vite-plugin-atelier @atelier-wb/[your-ui-framework]
   ```

1. register the plugin in `vite.config.js` file:

   ```js
   // other vite plugins
   import atelier from '@atelier-wb/vite-plugin-atelier'

   export default defineConfig({
     plugins: [/* other plugins */ atelier({ framework: 'your-ui-framework' })]
   })
   ```

1. start vite in dev mode:

   ```shell
   npx vite
   ```

1. then browse your components on http://localhost:3000/atelier.

---

## Configuration API

The atelier plugin function takes the following settings:

- `framework` (detaults to `svelte`): your UI framework of choice. To this day, only [Svelte][svelte] is supported.
- `url` (detaults to `/atelier/`): the url root under which Atelier's UI will be available. Must have leading and trailing `/`.
- `path` (defaults to `./atelier`): the path to the top level folder containing your `*.tools.*` files. It could be either absolute, or relative to your vite configuration file.
- `toolRegexp` (defaults to `/\.tools(?!\.shot$).+$/`, any files endinf with `.tools.` but `.tools.shot`): the regular expression used to find your tool files.
- `outDir` (defaults to `./dist-atelier`): path to the folder which will contain the static export of your atelier. Set to `null` to disable export.
- `setupPath`: optional path to a file **imported** prior to any of your tool files. It can be absolute, from node_modules, or relative to `path`.
- `publicDir`: optional path, or list of paths, to folders containing static assets your tools may use.

For example:

```js
atelier({
  framework: 'svelte',
  url: '/atelier/',
  toolRegexp: '\\.tools\\.svelte$',
  path: './tests', // cwd()/tests/**/*.tools.svelte
  setupPath: './atelier-setup.js' // cwd()/tests/atelier-setup.js
})
```

[svelte]: https://svelte.dev
[svelte-bindings]: https://github.com/feugy/atelier/tree/main/packages/svelte
[vite]: https://vitejs.dev
[vite-getting-started]: https://vitejs.dev/guide/#scaffolding-your-first-vite-project
