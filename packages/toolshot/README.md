# Atelier - Jest Toolshot

[![](https://img.shields.io/npm/v/@atelier-wb/toolshot.svg)](https://www.npmjs.com/package/@atelier-wb/toolshot)

Weclome to the Atelier!

Toolshot allows you to make snapshots of your components as part of your [Jest][jest] test suite.

---

- [Getting started](#getting-started)
- [Configuration API](#configuration-api)

---

## Getting started

You'll need first to write some "tools" files for your UI components.

Please refer to your UI framework binding API:

- [for svelte][svelte-bindings]

Then, assuming you already installed Jest and configured it to support your favorite UI framework:

1. create a test file (`atelier.test.js` for example) \_in the same folder as your `*.tools.*` files:

   ```js
   import { configureToolshot } from '@atelier-wb/toolshot'

   configureToolshot()
   ```

1. run jest... it'll create _a snapshot for each of_ your tools.

These snapshots work the [same way as regular Jest snapshots][snapshot-testing].

---

## Configuration API

The atelier plugin function takes the following settings:

- `folder` (detaults to `.`): root folder under which toolshot will search for `*.tools.*` files.

- `include` (defaults to `/\.tools(?!\.shot$).+$/`, any files endinf with `.tools.` but `.tools.shot`): the regular expression used to find your tool files.

- `snapshotFolder` (defaults to `__snapshots__`): name of the folder storing the snapshot files.

- `suite` (defaults to `Toolshot`): name used in Jest report

- `timeout` (default to 5000): timeout, in milliseconds, for each individual tool.

For example:

```js
configureToolshot({
  folder: join(__dirname, '..'),
  include: '^((?!Dialogue|SystemNotifier).)*\\.tools\\.svelte$',
  timeout: 10e3
})
```

[jest]: https://jestjs.io
[svelte-bindings]: https://github.com/feugy/atelier/tree/main/packages/svelte
[snapshot-testing]: https://jestjs.io/docs/snapshot-testing#snapshot-testing-with-jest
