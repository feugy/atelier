<script>
  import { getContext } from 'svelte'
  import * as ToolBox from '../../src/components/ToolBox.svelte'

  const toolBox = getContext(ToolBox.contextKey)
</script>

{#if toolBox}
  <main>{JSON.stringify(toolBox, null, 2)}</main>
{/if}
