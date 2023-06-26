<script>
  import { createEventDispatcher } from 'svelte'
  import { fly } from 'svelte/transition'
  import { getName, getParentName, isFolder } from './utils.js'

  export let tools
  export let currentPath
  export let selectedPath = null
  export let moveForward

  const dispatch = createEventDispatcher()

  $: isCurrent =
    !currentPath || getParentName(tools[0]?.fullName) === currentPath

  function navigateTo(tool) {
    dispatch('select', tool)
  }

  function makeKeyHandler(background) {
    return ({ code }) => {
      if (code === 'Enter' || code === 'Space') {
        navigateTo(background)
      }
    }
  }
</script>

<ul>
  {#each tools as tool}
    {@const selected = selectedPath === tool?.fullName}
    <li
      class:isCurrent
      role="treeitem"
      aria-selected={selected}
      on:keydown|stopPropagation={makeKeyHandler(tool)}
      on:click|stopPropagation={() => navigateTo(tool)}
    >
      {#if isCurrent}
        <div
          class:current={selected}
          class:folder={isFolder(tool)}
          in:fly={{ x: moveForward ? 200 : -200, duration: 350 }}
        >
          <span class="material-icons symbol"
            >{isFolder(tool) ? 'folder_open' : 'architecture'}</span
          >{getName(tool.fullName)}
        </div>
      {:else if isFolder(tool)}
        <svelte:self
          tools={tool.children}
          {selectedPath}
          {currentPath}
          {moveForward}
          on:select
        />
      {/if}
    </li>
  {/each}
</ul>

<style lang="postcss">
  ul {
    overflow: hidden auto;
  }

  li {
    @apply cursor-pointer select-none;

    &.isCurrent {
      @apply mt-2;
    }

    & .current {
      @apply text-$primary;

      & .symbol {
        @apply text-$primary;
      }
    }

    & .symbol {
      /* @apply text-$base-lighter mr-2; */
      @apply text-$secondary mr-2;
    }

    & .folder .symbol {
      /* @apply text-$secondary-light; */
      @apply text-$base;
    }
  }
</style>
