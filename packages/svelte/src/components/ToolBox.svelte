<script context="module">
  export const contextKey = 'toolbox'
</script>

<script>
  import { setContext } from 'svelte'

  export let name = null
  export let component = null
  export let props = {}
  export let events = []
  setContext(contextKey, { name, component, props, events })
</script>

<slot />
