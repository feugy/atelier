<script>
  export let message
</script>

<style lang="postcss">
  .disclaimer {
    @apply italic text-center m-8 text-$secondary-lighter;
  }
</style>

<div class="disclaimer">{message}</div>
