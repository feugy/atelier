<script>
  import { currentTool } from '../stores'
  export let tools = []
</script>

<svelte:window
  on:onerror={() => location.reload()}
  on:unhandledrejection={() => location.reload()}
/>

<!-- svelte-ignore a11y-no-redundant-roles -->
<section role="region" class={$currentTool?.data?.layout ?? 'fullscreen'}>
  {#each tools as tool}
    <svelte:component this={tool} />
  {/each}
</section>

<style>
  section {
    display: flex;
    width: 100%;
    height: 100%;
  }

  :global(:not(.centered) > .tool.visible) {
    flex-grow: 1;
  }

  section.padded {
    padding: 2rem;
  }

  section.centered {
    align-items: center;
    justify-content: center;
  }
</style>
