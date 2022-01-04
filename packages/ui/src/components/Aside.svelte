<script>
  import { _ } from 'svelte-intl'
  import Explorer from './Explorer/Explorer.svelte'

  export let tools = []
  export let current = null
</script>

<style lang="postcss">
  aside {
    @apply p-4 w-1/6 overflow-auto flex-shrink-0;
    h1 {
      @apply px-4 text-2xl text-center mb-2;

      & .material-icons {
        @apply text-4xl text-$primary;
      }
    }
  }
</style>

<aside>
  <h1>
    <span class="material-icons">handyman</span>
    <span>{$_('title.app')}</span>
  </h1>
  <slot />
  <Explorer {tools} {current} on:select />
</aside>
