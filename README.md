# Atelier

Weclome to the Atelier!

[![GitHub](https://img.shields.io/github/license/feugy/atelier)][license]
[![CI](https://github.com/feugy/atelier/actions/workflows/CI.yml/badge.svg)](https://github.com/feugy/atelier/actions/workflows/CI.yml)
[![Codacy](https://app.codacy.com/project/badge/Grade/4f26d900b38547fbbb8899c853fca159)](https://www.codacy.com/gh/feugy/atelier/dashboard?utm_source=github.com&utm_medium=referral&utm_content=feugy/atelier&utm_campaign=Badge_Grade)

## What is this?

Atelier (French word for workbench or workshop) is a simple UI component explorer, like [angular-playground] [react-cosmos], [storybook], [styleguidist], [svench].

It is a tool to implement [Component Driven User Interfaces][cdd]: a workbench on which you can craft reusable UI components in isolation.

It's based on [vitejs] JavaScript bundler.

## How do I use it with Svelte?

1. Install the plugin for Vite and Svelte bindings.

   ```shell
   npm i -D @atelier/vite-plugin-svelte @atelier/svelte
   ```

2. Register the plugin in `vite.config.js` file:

   ```js
   import svelte from '@sveltejs/vite-plugin-svelte'
   // other vite plugins
   import atelier from '@atelier/vite-plugin-svelte'

   export default defineConfig({
     plugins: [svelte(), /* other plugins */ atelier()]
   })
   ```

3. Next to your `vite.config.js` file, creates a folder named `atelier`

4. Assuming the components you'd like to test is located in `src/MyComponent.svelte`, create a file names `atelier/MyComponent.tools.svelte` and set its content to:

   ```js
   <script>
     import { Tool } from '@atelier/svelte'
     import MyComponent from '../src/MyComponent.svelte'
   </script>

   <Tool name="Components/My component" component={MyComponent} />
   ```

5. Start vite, and navigate to http://localhost:3000/atelier!

## Why another one?

Now, about the elephant in the room: _Storybook is a wonderful tool_.

However, storybook does not bring an enjoyable developer experience, mostly because of webpack.
A lot of people throw a lot of effort to improve it for common cases, leading to powerfull starterkits like [create-react-app], or many blogpost (for fun, type "storybook + nextjs" on a search engine).

If your project is different (like svelte on snowpack for example), you're very likely doomed to recreate a whole webpack configuration for it, leading to a very fragile and unefficient setup.

Atlier seamlessly integrates with [vitejs] bundler, and give you back control.

It won't try to rebuild your code and bring a different HMR system. It won't be another tool you need to learn before being enjoyed.

## Can I use it with X, Y and Z?

As we speak, Atelier supports these UI frameworks:

- [svelte]

Eventually we aim at supporting any framework Vite can bundle.

[angular-playground]: https://angularplayground.it/
[cdd]: https://www.componentdriven.org/
[chromatic]: https://github.com/meteor/chromatic/
[create-react-app]: https://create-react-app.dev/
[license]: https://github.com/feugy/atelier/blob/master/LICENSE
[react-cosmos]: https://reactcosmos.org/
[storybook]: https://storybook.js.org/
[styleguidist]: https://react-styleguidist.js.org/
[svelte]: svelte.dev/
[svench]: https://svench-docs.vercel.app
[vitejs]: https://vitejs.dev/
