# Features

## Plugin

- `setupPath` to be considered relative to `path`
- remove tools on updates (toolbox/tool renamal, file deletion)

## UI

- layouts
- loading indicator
- hide some props from pane
- color picker
- a dropdown button to select background colors
- a dropdown button to select pre-defined viewports
- warn on tool name collisions
- graceful unhandled-rejection/uncaught-exception handling in Workbench

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

# Documentation

- Deep dive how-to write tools
- Deep dive how-to write toolboxes
- Deep dive how-to configure vite
- Deep dive how-to configure toolshot
- How to develop plugins
- How to release
  ```shell
  npm run release:bump -- --release-as major|minor|patch
  npm publish --workspaces packages/* --access public
  ```
