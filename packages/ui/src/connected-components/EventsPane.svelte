<script context="module">
  export const isEnabled = (tool, events) =>
    Boolean(tool?.events?.length || events?.length)
</script>

<script>
  import { EventLogger } from '../components'
  import { events, clearEvents } from '../stores'
</script>

<EventLogger events={$events} on:clear-events={clearEvents} />
