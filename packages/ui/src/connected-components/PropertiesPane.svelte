<script context="module">
  export const isEnabled = tool => Object.keys(tool?.props || {}).length > 0
</script>

<script>
  import { Properties } from '../components'
  import { currentTool, updateProperty } from '../stores'
</script>

<Properties properties={$currentTool?.props} on:prop-change={updateProperty} />
