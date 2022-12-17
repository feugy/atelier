<script>
  export let text = null
  export let primary = false
  export let icon = null
  export let noColor = false

  $: iconOnly = !text
</script>

<button
  class:primary
  class:iconOnly
  class:noColor
  {...$$restProps}
  on:click|stopPropagation
>
  {#if icon}<i class="material-icons">{icon}</i>{/if}
  {#if text}<span>{text}</span>{/if}
  <slot />
</button>

<style lang="postcss">
  button {
    @apply inline-flex cursor-pointer px-6 py-2 
      flex-row items-center transition transform
      rounded border-none bg-transparent 
      capitalize text-base whitespace-nowrap;

    &:not(.noColor) {
      @apply bg-$base;
    }

    &:disabled {
      @apply cursor-default bg-$disabled;
    }

    & > i {
      font-size: 'inherit';
    }

    &:focus {
      @apply outline-none;
    }

    &:not(:disabled) {
      &:hover,
      &:focus,
      &:active {
        @apply scale-105;
        &:not(.noColor) {
          @apply bg-$base-light;
        }
      }
    }

    &.primary:not(:disabled):not(.noColor) {
      @apply bg-$primary;

      &:hover,
      &:focus,
      &:active {
        @apply bg-$primary-light;
      }
    }

    &.iconOnly {
      @apply p-2 rounded-full;

      &:not(:disabled) {
        &:hover,
        &:focus {
          @apply scale-110;
        }
        &:active {
          @apply scale-110;
        }
      }
    }

    &:not(.iconOnly) > i {
      @apply -ml-1 mr-1;
    }
  }
</style>
