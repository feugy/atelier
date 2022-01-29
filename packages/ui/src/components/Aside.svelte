<script>
  import { _ } from 'svelte-intl'
</script>

<style lang="postcss">
  aside {
    @apply relative p-4 w-1/5 h-screen flex flex-col flex-shrink-0 overflow-hidden;
  }

  span {
    @apply z-1 flex flex-col overflow-hidden;
  }

  div {
    @apply absolute bottom-5
            text-$base text-center opacity-10 
            select-none pointer-events-none;

    & h1 {
      @apply leading-22;
      font-size: 8vw;
    }

    .material-icons {
      @apply text-$primary;
      font-size: 25vw;
    }
  }
</style>

<aside>
  <span>
    <slot />
  </span>
  <div>
    <span class="material-icons">handyman</span>
    <h1>{$_('title.app')}</h1>
  </div>
</aside>
