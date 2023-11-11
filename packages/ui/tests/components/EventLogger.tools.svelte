<script>
  import { Tool, ToolBox } from '@atelier-wb/svelte'

  import EventLogger from '../../src/components/EventLogger.svelte'
  import { eventData } from './EventLogger.testdata'
</script>

<ToolBox
  name="Components/Event logger"
  component={EventLogger}
  events={['clear-events']}
>
  <Tool
    name="With events"
    props={{ events: eventData }}
    let:props
    let:handleEvent
  >
    <EventLogger {...props} on:clear-events={handleEvent} />
  </Tool>

  <Tool name="Empty" />
</ToolBox>
