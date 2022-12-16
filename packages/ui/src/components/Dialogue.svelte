<script>
  import Portal from 'svelte-portal'

  export let title = ''
  export let open = true
</script>

<Portal>
  <div class="filter" class:open />
  <div class="backdrop" class:open>
    <article role="dialog" on:click|stopPropagation on:keydown|stopPropagation>
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

<style lang="postcss">
  .backdrop,
  .filter {
    @apply fixed flex items-center justify-center 
           inset-0 m-0 z-10 p-10
           opacity-0 transition duration-400 pointer-events-none;

    &.open {
      @apply opacity-100 pointer-events-auto;
    }
  }

  .filter {
    @apply bg-$base-darkest duration-100;
    &.open {
      @apply opacity-90 backdrop-filter backdrop-blur-sm;
    }
  }

  article {
    @apply flex flex-col text-center 
           w-full md:w-8/10 lg:w-7/10 xl:w-1/2 
           max-h-full md:max-h-8/10 
           shadow-xl bg-$base-dark;
  }

  .content {
    @apply overflow-y-auto;
  }

  header {
    @apply m-4 mt-0 p-4 text-2xl border-b border-$primary text-$primary-light;
  }

  footer {
    @apply mt-4 p-4;
  }
</style>
