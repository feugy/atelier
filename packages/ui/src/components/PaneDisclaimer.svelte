<script>
  export let message
</script>

<style lang="postcss">
  .disclaimer {
    @apply italic text-center m-8;
    color: theme('colors.secondary.dark');
  }
</style>

<div class="disclaimer">{message}</div>
