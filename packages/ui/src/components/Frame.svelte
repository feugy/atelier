<script>
  import { createEventDispatcher } from 'svelte'
  import Loader from './Loader.svelte'

  export let frame = null
  export let viewport = null
  export let src = 'workframe.html'

  const dispatch = createEventDispatcher()
  let isLoading = true

  function handleLoad() {
    isLoading = false
  }

  function handleError({ error }) {
    isLoading = false
    dispatch('error', error)
  }
</script>

<span class="viewport-container">
  <div bind:this={viewport}>
    {#if isLoading}<span class="loader"><Loader /></span>{/if}
    <iframe
      title="workframe"
      bind:this={frame}
      on:load={handleLoad}
      on:abort={() => handleError({ error: new Error('aborted') })}
      on:error={handleError}
      {src}
    />
  </div>
</span>

<style lang="postcss">
  .viewport-container {
    @apply flex p-4 overflow-auto flex-grow items-center;
  }

  div {
    @apply relative flex-grow h-full shadow-xl transition-all border border-$base-dark;
  }

  :global(.viewport-container.frame > div) {
    @apply flex-none m-auto;
  }

  .loader {
    @apply absolute invert-0 h-full w-full flex items-center justify-center;
  }

  iframe {
    @apply inline-block border-none h-full w-full;
  }
</style>
