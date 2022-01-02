<script>
  export let text = null
  export let primary = false
  export let icon = null
  export let noColor = false

  $: iconOnly = !text
</script>

<style lang="postcss">
  button {
    @apply inline-flex border-none cursor-pointer px-6 py-2 capitalize text-base
  font-semibold bg-transparent flex-row items-center rounded whitespace-nowrap transition;

    &:not(.noColor) {
      background-color: theme('colors.secondary.main');
      color: theme('colors.secondary.text');
    }

    &:disabled {
      @apply cursor-default;
      background-color: theme('colors.disabled.main');
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
        transform: scale(1.03);
        &:not(.noColor) {
          background-color: theme('colors.secondary.dark');
        }
      }
    }

    &.primary {
      color: theme('colors.primary.text');

      &:not(:disabled):not(.noColor) {
        background-color: theme('colors.primary.main');

        &:hover,
        &:focus,
        &:active {
          background-color: theme('colors.primary.light');
        }
      }
    }

    &.iconOnly {
      @apply p-2 rounded-full;

      & > i {
        font-size: 'inherit';
      }

      &:not(:disabled) {
        &:hover,
        &:focus {
          transform: scale(1.1);
        }
        &:active {
          transform: scale(0.95);
        }
      }
    }

    &:not(.iconOnly) > i {
      margin-left: -0.3em;
      margin-right: 0.3em;
    }
  }

  @keyframes ripple {
    0% {
      height: 100%;
      width: 100%;
      opacity: 0;
    }
    75% {
      height: 500%;
      width: 500%;
      opacity: 0.75;
    }
    100% {
      height: 1000%;
      width: 1000%;
      opacity: 0;
    }
  }
</style>

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
