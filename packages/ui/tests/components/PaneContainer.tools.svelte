<script>
  import { Tool, ToolBox } from '@atelier/svelte'
  import PaneContainer from '../../src/components/PaneContainer.svelte'
  import EventLogger from '../../src/components/EventLogger.svelte'
</script>

<ToolBox
  name="Components/Pane container"
  component={PaneContainer}
  events={['click']}
>
  <Tool
    name="Multiple tabs"
    props={{
      tabs: [
        { name: 'First tab', content: `I'm tab 1` },
        { name: 'Another one', content: `I'm tab 2` },
        { name: 'A third...', content: `I'm tab 3` },
        { name: 'At last!', content: `I'm tab 4` }
      ]
    }}
  />

  <Tool
    name="With components"
    props={{
      tabs: [
        { name: 'component', content: EventLogger },
        { name: 'text', content: 'Some text' }
      ]
    }}
  />

  <Tool
    name="Single tab"
    props={{ tabs: [{ name: 'tab 1', content: `I'm tab 1` }] }}
  />

  <Tool name="Empty" />
</ToolBox>
