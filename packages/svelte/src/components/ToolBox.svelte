<script context="module">
  export const contextKey = 'toolbox'
</script>

<script>
  import { setContext } from 'svelte'

  export let name = null
  export let component = null
  export let props = {}
  export let events = []
  export let setup = null
  export let teardown = null
  setContext(contextKey, {
    name,
    component,
    props,
    events,
    setup,
    teardown,
    data: $$restProps
  })
</script>

<slot />
