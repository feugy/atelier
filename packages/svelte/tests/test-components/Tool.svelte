<script>
  import { createEventDispatcher, getContext, onMount } from 'svelte'
  import * as ToolBox from '../../src/components/ToolBox.svelte'

  const context = getContext(ToolBox.contextKey)
  const dispatch = createEventDispatcher()

  onMount(() => dispatch('context', context))
</script>
