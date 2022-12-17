<script>
  import { createEventDispatcher } from 'svelte'
  export let path

  $: legs = path ? [null, ...path.split('/')] : []

  const dispatch = createEventDispatcher()

  function navigate(index) {
    dispatch('navigate', legs.slice(1, index + 1).join('/') || null)
  }

  function makeKeyHandler(index) {
    return ({ code }) => {
      if (code === 'Enter' || code === 'Space') {
        navigate(index)
      }
    }
  }
</script>

<nav>
  <ol>
    {#each legs as leg, index}
      {#if index !== legs.length - 1}
        <li
          role="button"
          on:keydown={makeKeyHandler(index)}
          on:click={() => navigate(index)}
        >
          {#if leg}{leg}{:else}<span class="material-icons">home</span>{/if}
        </li>
        <span class="divider">/</span>
      {:else}
        <li>{leg}</li>
      {/if}
    {/each}
  </ol>
</nav>

<style lang="postcss">
  nav {
    @apply text-sm text-$base-lightest mb-4 mx-2;

    .material-icons {
      @apply text-base;
    }

    & li {
      @apply inline-block;

      &:not(:last-child) {
        @apply cursor-pointer;
      }
    }

    .divider {
      @apply px-2;
    }
  }
</style>
