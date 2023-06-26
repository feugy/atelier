<script context="module">
  export const backgroundsSchema = {
    type: 'array',
    items: { type: 'string' }
  }
</script>

<script>
  import { createEventDispatcher } from 'svelte'

  export let viewport = null
  export let backgrounds = ['', 'white', '#e0e0e0', '#a0a0a0', 'black']

  let unset = true
  const dispatch = createEventDispatcher()

  $: if (viewport && backgrounds.length && unset) {
    unset = false
    apply(backgrounds[0])
  }

  function apply(background) {
    if (viewport) {
      viewport.style.background = background
      dispatch('select', background)
    }
  }
</script>

<div role="toolbar">
  {#each backgrounds as background}
    <button
      style="--background:{background};"
      on:click={() => apply(background)}
    />
  {/each}
</div>

<style lang="postcss">
  div {
    @apply inline-flex;
  }

  button {
    @apply block w-6 h-6 border border-$base cursor-pointer;
    background: var(--background);
  }
</style>
