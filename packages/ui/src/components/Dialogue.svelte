<script>
  import Portal from 'svelte-portal'

  export let title = ''
  export let open = true
</script>

<style lang="postcss">
  .backdrop,
  .filter {
    @apply fixed flex items-center justify-center inset-0 m-0 z-10 p-10;
    visibility: hidden;
  }

  .filter.open {
    @apply visible;
    backdrop-filter: blur(2px);
  }

  .backdrop {
    opacity: 0;
    transition: all 0.35s ease;
    background-color: theme('background.overlay');

    &.open {
      @apply opacity-100 visible;
    }
  }

  article {
    @apply flex flex-col text-center w-full md:w-8/10 lg:w-7/10 xl:w-1/2 max-h-full md:max-h-8/10 shadow-xl;
    background-color: theme('background.page');
    --tw-shadow: var(--tw-shadow-colored);
    --tw-shadow-color: theme('shadow.overlay');
  }

  .content {
    @apply overflow-y-auto;
  }

  header {
    @apply m-4 mt-0 p-4 text-2xl border-b;
    border-bottom-color: theme('colors.primary.main');
  }

  footer {
    @apply mt-4 p-4;
  }
</style>

<Portal>
  <div class="filter" class:open />
  <div class="backdrop" class:open>
    <article role="dialog" on:click|stopPropagation>
      <header role="heading" aria-level="1">{title}</header>
      <div class="content">
        <slot />
      </div>
      <footer>
        <slot name="footer" />
      </footer>
    </article>
  </div>
</Portal>
