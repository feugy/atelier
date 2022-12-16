<script>
  export let message
</script>

<div class="disclaimer">{message}</div>

<style lang="postcss">
  .disclaimer {
    @apply italic text-center m-8 text-$secondary-lighter;
  }
</style>
