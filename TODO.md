# Features

## Plugin

- remove tools on updates (toolbox/tool renamal, file deletion)
- configure viewports as plugin settings
- configure background colors as plugin settings

## UI

- revamp UI
  - icon & title as watermark, bottom right corner
  - isolate Frame styling in a component
  - display properties pane below explorer
  - display Event pane at the bottom
  - 'Slider' to select background colors, below Frame
  - 'Slider' to select pre-defined viewports, below Frame
- hide some props from pane
- color picker
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

- Deep dive how-to write UI bindings
- Deep dive how-to write toolboxes
- How to develop plugins
- How to release
  ```shell
  npm run release:bump -- --release-as major|minor|patch
  npm publish --workspaces packages/* --access public
  ```
