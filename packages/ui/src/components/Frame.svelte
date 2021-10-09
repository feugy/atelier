<script>
  import { createEventDispatcher } from 'svelte'

  export let frame = null
  export let src = 'workframe.html'

  const dispatch = createEventDispatcher()
</script>

<style type="postcss">
  iframe {
    @apply inline-block border-none h-full w-full;
  }
</style>

<iframe
  title="workframe"
  bind:this={frame}
  on:load
  on:abort={() => dispatch('error', new Error('aborted'))}
  on:error={evt => dispatch('error', evt.error)}
  {src}
/>
