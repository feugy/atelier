# Atelier - Svelte bindings

[![](https://img.shields.io/npm/v/@atelier-wb/svelte.svg)](https://www.npmjs.com/package/@atelier-wb/svelte)

Weclome to the Atelier!

This package contains bindings for [Svelte][svelte] UI framework.
They allow you to test your Svelte components in isolation.

---

- [Getting started](#getting-started)
- [Tweak properties](#tweak-properties)
- [Events reporting](#events-reporting)
- [Slots and side markup](#slots-and-side-markup)
- [Setup and teardown code](#setup-and-teardown-code)
- [Tool boxes](#tool-boxes)
- [Examples](#examples)

---

## Getting started

Create a file with `.tools.svelte` extension.

```js
<script>
  import { Tool } from '@atelier-wb/svelte'
  import MyComponent from './MyComponent.svelte'
</script>

<Tool
  name="My Awesome Component"
  component={MyComponent}
/>
```

That's it!
Now configure [Atelier with Vite][vite-plugin], and browse to http://localhost:3000/atelier: you'll see your component in action!

Each tool operates on one of your component, and can:

- controls its properties
- listen to its events

---

## Tweak properties

To enable property control, just initialize them in your tool's `props`:

```js
<Tool
  name="My Awesome Component"
  component={MyComponent}
  props={{ prop1: 'my component first prop', prop2: 42 }}
/>
```

Atelier will automatically creates controls in the "Properties" tab so you can change your property values.

It supports numbers, booleans, strings, arrays and objects.

> Functions and Svelte stores can not be configured from Atelier.

---

## Events reporting

To listen to your event properties (either DOM native or custom), write their names in an `events` array:

```js
<Tool
  name="My Awesome Component"
  component={MyComponent}
  events={['click', 'custom-event']}
/>
```

Once they'll be triggered, Atelier will show the time, event name and details in the "Events" tab.

It is automatically cleared when opening a different tool, and there is a button to do it manually.

---

## Slots and side markup

If your component uses slots, or needs some companion markup, you can use `<Tool>` as templates:

```js
<Tool
  name="My Awesome Component"
  props={{ prop1: 'my component first prop', prop2: 42 }}
  let:props
  let:handleEvent
>
  <div>You can put any markup before the component.<div>

  <MyComponent
    {...props}
    on:click={handleEvent}
    on:custom-event={handleEvent}
  >
    <span>this goes into YOUR component</span>
  </MyComponent>

  <div>You can also have markup after.<div>
</Tool>
```

Please note key differences:

- tool does not need `component={MyComponent}` any more

- tool has `let:props`, and your component has `{...props}`.
  This allows Atelier to configure properties even if your component is "burried" into the template

- tool has `let:handleEvent`, and your component binds it to specific event.
  This allows Atelier to receive any event you'd like.

If you want to tweak properties, don't forget to initialize them on `Tool`: otherwise Atelier will not generates the corresponding controls.

---

## Setup and teardown code

If you need to run code _every time your tool loads_, you can use `setup` function:

```js
<Tool
  name="My Awesome Component"
  component={MyComponent}
  props={{ prop1: 'my awesome prop' }}
  setup={async ({ name, props }) => {
    return newProps
  }}
/>
```

The `setup` function:

- could either be synchronous or asynchronous.

- receives a single object parameter, with the `name` and `props` keys (the ones you passed to `<Tool/>`)
- **can return** new `props` for your component.
  If `setup()` returns nothing, `props` from the markup will be used.

You can also use `teardown ` function:

```js
<Tool
  name="My Awesome Component"
  component={MyComponent}
  teardown={async name => {}}
/>
```

The `teardown` function:

- could either be synchronous or asynchronous.

- receives the component `name` (the one you passed to `<Tool/>`)

---

## Tool boxes

You can add as many `<Tool/>` in the same file as you want.
But there may be a lot of code duplication!

`<ToolBox/>` can solve this issue:

```js
<ToolBox name="My Awesome Component" component={MyComponent}>
  <Tool name="Primary" props={{ color: 'red', primary: true }} />
  <Tool name="Secondary" props={{ color: 'blue' }} />
</ToolBox>
```

This helps you easily test variations of the same component.

Important highlights:

- a tool's full name is its tool box's name + its own name. In the example above: `My Awesome Component / Primary`

- a tool box supports _exactly the same properties_ as tool, with some specificities:

  - `name` are concatenated, as explained above.

  - tool's `component` override tool box.

  - `props` are merged.

  - `events` are merged.

  - tool box's `setup()` runs _before_ the tool's `setup()`. The result of the primer becomes `props` parameter of the later.

  - tool box's `teardown()` runs _after_ the tool's `teardown()`.

- tool box _do not support_ templates.

---

## Examples

Now that you know everything, you may want some real examples.

You'll find some in Atelier's [UI tests][ui-tests]

[svelte]: https://svelte.dev
[vite-plugin]: https://github.com/feugy/atelier/tree/main/packages/vite-plugin-atelier
[ui-tests]: https://github.com/feugy/atelier/blob/main/packages/ui/tests/components
