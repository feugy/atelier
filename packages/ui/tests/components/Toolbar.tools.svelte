<script>
  import { recordEvent, Tool } from '@atelier-wb/svelte'
  import Toolbar from '../../src/components/Toolbar.svelte'

  let viewport
</script>

<style lang="postcss">
  .container {
    @apply h-full w-full;
  }
  .viewport {
    @apply bg-gray-600 w-full h-full;
  }
</style>

<Tool name="Components/Toolbar">
  <Toolbar {viewport} />
  <div class="container" bind:this={viewport}>
    <div class="viewport" on:click={() => recordEvent('test', true)} />
  </div>
</Tool>
