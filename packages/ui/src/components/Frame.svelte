<script>
  import { createEventDispatcher } from 'svelte'

  export let layout = null
  export let frame = null
  export let height = null
  export let width = null
  export let src = 'workframe.html'

  const dispatch = createEventDispatcher()
</script>

<style type="postcss">
  iframe {
    @apply inline-block border-none;
  }

  div {
    @apply flex justify-center items-center h-full w-full;

    &.padded {
      @apply p-8;
    }

    &.centered > iframe {
      @apply h-auto w-auto;
    }
  }
</style>

<div class={layout}>
  <iframe
    title="workframe"
    bind:this={frame}
    style="height: {layout === 'centered'
      ? `${height}px`
      : '100%'}; width: {layout === 'centered' ? `${width}px` : '100%'}"
    on:load
    on:abort={() => dispatch('error', new Error('aborted'))}
    on:error={evt => dispatch('error', evt.error)}
    {src}
  />
</div>
