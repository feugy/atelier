<script>
  export let layout = 'fullscreen'
  export let frame = null
  export let src = 'workframe.html'
</script>

<style type="postcss">
  iframe {
    @apply inline-block border-none;

    &.fullscreen {
      @apply w-full h-full;
    }

    &.padded {
      @apply p-8 w-full;
    }

    &.centered {
      @apply inline-flex justify-center;
    }
  }
</style>

<iframe
  title="workframe"
  class={layout ?? 'fullscreen'}
  bind:this={frame}
  {src}
/>
