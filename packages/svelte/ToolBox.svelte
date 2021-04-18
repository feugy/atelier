<script context="module">
  export const contextKey = 'toolbox'
</script>

<script>
  import { setContext } from 'svelte'

  export let name
  export let component
  export let events = []
  setContext(contextKey, { name, component, events })
</script>

<slot />
