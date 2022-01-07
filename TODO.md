# Features

## Plugin

- configure viewports as plugin settings
- configure background colors as plugin settings
- remove tools on updates (toolbox/tool renamal, file deletion)
- can it be framework agnostic?

## UI

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

- degit recipe
- Deep dive how-to write UI bindings
- Deep dive how-to write toolboxes
- How to develop plugins
- How to release
  ```shell
  npm run release:bump -- --release-as major|minor|patch
  npm publish --workspaces packages/* --access public
  ```
