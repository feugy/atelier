<script>
  import { Tool, ToolBox } from '@atelier-wb/svelte'
  import { writable } from 'svelte/store'

  import PaneContainer from '../../src/components/PaneContainer.svelte'
  import { Pane1, Pane2, Pane3 } from '../test-components'

  const isEnabled = () => true
</script>

<ToolBox
  name="Components/Pane container"
  component={PaneContainer}
  props={{ currentTool: writable({}), events: writable([]) }}
>
  <Tool
    name="Multiple tabs"
    props={{
      tabs: [
        { name: 'First tab', component: Pane1.default, isEnabled },
        { name: 'Another one', component: Pane2.default, isEnabled },
        { name: 'A third...', component: Pane3.default, isEnabled }
      ]
    }}
    let:props
  >
    <span>
      <PaneContainer {...props} />
    </span>
  </Tool>

  <Tool
    name="Single tab"
    props={{
      tabs: [{ name: 'tab 1', component: Pane1.default, isEnabled }]
    }}
    let:props
  >
    <span>
      <PaneContainer {...props} />
    </span>
  </Tool>

  <Tool name="Empty" />
</ToolBox>

<style lang="postcss">
  span {
    @apply h-full;
  }
</style>
