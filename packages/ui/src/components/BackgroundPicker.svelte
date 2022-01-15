<script context="module">
  export const backgroundsSchema = {
    type: 'array',
    items: { type: 'string' }
  }
</script>

<script>
  import { createEventDispatcher, onMount } from 'svelte'

  export let viewport = null
  export let backgrounds = ['', 'white', '#e0e0e0', '#a0a0a0', 'black']

  const dispatch = createEventDispatcher()

  onMount(() => apply(backgrounds[0]))

  function apply(background) {
    if (viewport) {
      viewport.style.background = background
      dispatch('select', background)
    }
  }
</script>

<style lang="postcss">
  ul {
    @apply inline-flex;
  }

  li {
    @apply block w-6 h-6 border border-$base cursor-pointer;
    background: var(--background);
  }
</style>

<ul role="toolbar">
  {#each backgrounds as background}
    <li style="--background:{background};" on:click={() => apply(background)} />
  {/each}
</ul>
