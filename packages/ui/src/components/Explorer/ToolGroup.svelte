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
</script>

<style lang="postcss">
  li {
    @apply cursor-pointer mt-2 select-none;

    & .current {
      @apply bg-$primary;
    }

    & .symbol {
      @apply text-$secondary mr-2;
    }

    & .folder .symbol {
      @apply text-$primary;
    }
  }
</style>

<ul>
  {#each tools as tool}
    <li on:click|stopPropagation={() => navigateTo(tool)}>
      {#if isCurrent}
        <div
          class:current={selectedPath === tool?.fullName}
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
