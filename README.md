# Atelier

Weclome to the Atelier!

[![](https://img.shields.io/npm/v/@atelier-wb/vite-plugin-atelier.svg)](https://www.npmjs.com/package/@atelier-wb/vite-plugin-atelier)
[![GitHub](https://img.shields.io/github/license/feugy/atelier)][license]
[![CI](https://github.com/feugy/atelier/actions/workflows/CI.yml/badge.svg)](https://github.com/feugy/atelier/actions/workflows/CI.yml)
[![Codacy](https://app.codacy.com/project/badge/Grade/4f26d900b38547fbbb8899c853fca159)](https://www.codacy.com/gh/feugy/atelier/dashboard?utm_source=github.com&utm_medium=referral&utm_content=feugy/atelier&utm_campaign=Badge_Grade)

![Atelier UI](/assets/atelier.png)

## What is this?

Atelier (French word for workbench or workshop) is a simple UI component explorer, like [angular-playground] [react-cosmos], [storybook], [styleguidist], [svench] or [chromatic].

A workbench help you implementing [Component Driven Development][cdd]: crafting reusable UI components in isolation.

Atelier is based on [Vite] JavaScript bundler.

---

- [Getting started with Svelte](#getting-started-with-svelte)
- [Plugin API][plugin-api]
- [Svelte bindings API][svelte-api]
- [Jest Toolshot API][toolshot-api]
- [Why another one?](#why-another-one)

---

## Getting started with Svelte

1. Install the plugin for Vite and Svelte bindings.

   ```shell
   npm i -D @atelier-wb/vite-plugin-atelier @atelier-wb/svelte
   ```

2. Register the plugin in `vite.config.js` file:

   ```js
   import svelte from '@sveltejs/vite-plugin-svelte'
   // other vite plugins
   import atelier from '@atelier-wb/vite-plugin-atelier'

   export default defineConfig({
     plugins: [svelte(), /* other plugins */ atelier()]
   })
   ```

3. Next to your `vite.config.js` file, creates a folder named `atelier`

4. Assuming the components you'd like to test is located in `src/MyComponent.svelte`, create a file names `atelier/MyComponent.tools.svelte` and set its content to:

   ```js
   <script>
     import { Tool } from '@atelier-wb/svelte'
     import MyComponent from '../src/MyComponent.svelte'
   </script>

   <Tool name="Components/My component" component={MyComponent} />
   ```

5. Start vite, and navigate to http://localhost:3000/atelier

6. To export your atelier as a static website in `dist-atelier` folder, run this command:

   ```shell
   vite build --mode export-atelier
   ```

   Expose it with a plain http server (`npx -y serve dist-atelier` for example) to enjoy it!

---

## Why another one?

Now, let's talk about the elephant in the room: _Storybook is a wonderful tool_.

In my experience, Storybook does not bring an enjoyable developer experience, mostly because of webpack (as the time of writing).
A lot of people throw a lot of effort to improve it for common cases, leading to powerfull starterkits like [create-react-app], and many blogpost (try searching for "storybook + nextjs" 😉).

However, if your project is not react-based, you're very likely to be forced rewriting an entire webpack configuration, leading to a very fragile and unefficient setup. On medium-sized code base, build time is significant, and becomes a barrier to CDD.

Atlier seamlessly integrates with [Vite][vitejs] bundler, and give you back control.

[angular-playground]: https://angularplayground.it/
[cdd]: https://www.componentdriven.org/
[chromatic]: https://github.com/meteor/chromatic/
[create-react-app]: https://create-react-app.dev/
[license]: https://github.com/feugy/atelier/blob/main/LICENSE
[plugin-api]: https://github.com/feugy/atelier/tree/main/packages/vite-plugin-atelier
[react-cosmos]: https://reactcosmos.org/
[storybook]: https://storybook.js.org/
[styleguidist]: https://react-styleguidist.js.org/
[svelte]: https://svelte.dev
[svelte-api]: https://github.com/feugy/atelier/tree/main/packages/svelte
[svench]: https://svench-docs.vercel.app
[toolshot-api]: https://github.com/feugy/atelier/tree/main/packages/toolshot
[vitejs]: https://vitejs.dev/
