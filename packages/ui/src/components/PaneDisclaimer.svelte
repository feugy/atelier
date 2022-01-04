<script>
  export let message
</script>

<style lang="postcss">
  .disclaimer {
    @apply italic text-center m-8 text-$primary-light;
  }
</style>

<div class="disclaimer">{message}</div>
