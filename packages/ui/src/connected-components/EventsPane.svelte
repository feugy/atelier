<script context="module">
  export const isEnabled = tool => (tool?.events || []).length > 0
</script>

<script>
  import { EventLogger } from '../components'
  import { events } from '../stores'
</script>

<EventLogger events={$events} />
