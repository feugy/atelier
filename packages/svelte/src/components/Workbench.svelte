<script>
  export let tools = []
</script>

<svelte:window
  on:onerror={() => location.reload()}
  on:unhandledrejection={() => location.reload()}
/>

{#each tools as tool}
  <svelte:component this={tool} />
{/each}
