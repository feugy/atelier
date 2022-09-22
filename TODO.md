# Features

## UI

- warn on tool name collisions
- hide some props from pane
- color picker
- viewport zoom

## Svelte

- warn when neither ToolBox nor Tool has a component (and there are no slots)
- ToolBox template?
- issue with updating slot props :
  ```svelte
  <Tool
    name="Components/Dialogue"
    props={{ title: 'This is a title', open: true, noClose: false }}
    events={['close', 'open']}
    let:props
    let:handleEvent
  >
    <Dialogue {...props} on:close={handleEvent} on:open={handleEvent}>
      <div slot="content">
        Here is an important message, that you absolutely need to be aware of.
      </div>
      <span slot="buttons">
        <Button
          on:click={() => (props.open = false)}
          text={'Close'}
          icon={'close'}
        />
      </span>
    </Dialogue>
  </Tool>
  ```

## Vite plugin

- test with vite [createServer](https://vitejs.dev/guide/api-javascript.html#createserver) instead of starting one of our own

# Documentation

- plugin's uiSettings
- examples
- ADR:
  - UI agnostic framework
  - options from plugin to UI
  - register and remove tools (upon renamal)
- degit recipe
- Deep dive how-to write UI bindings
- Deep dive how-to write toolboxes
- How to develop plugins
- Release:
  - `npm run release:bump`
  - `git add CHANGELOG.md`
  - `git commit --amend --no-edit`
  - `git push`
  - `npm publish -w packages --otp 531066`
