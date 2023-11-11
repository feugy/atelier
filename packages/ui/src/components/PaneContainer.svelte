<script>
  import { _ } from 'svelte-intl'

  import Button from './Button.svelte'
  import PaneDisclaimer from './PaneDisclaimer.svelte'

  export let tabs = []
  export let currentTool = null
  export let events = null
  let main
  let selected = 0

  // compute tab enablity statuses
  $: tabEnability = tabs.map(
    ({ isEnabled }) => currentTool && isEnabled($currentTool, $events)
  )
  // retain selected tab if it still points at an existing, enabled tab, or find first enabled tab
  $: selected =
    selected >= 0 && selected < tabs.length && tabEnability[selected]
      ? selected
      : tabEnability.findIndex(enabled => enabled)
  // initially collapsed when all tabs are disabled
  $: collapsed = tabEnability.every(enabled => !enabled)

  $: allDisabled = tabEnability.every(enabled => !enabled)

  function select(i) {
    selected = i
  }

  function toggleCollapse() {
    collapsed = !collapsed
  }

  function makeKeyHandler(i) {
    return ({ code }) => {
      if (code === 'Enter' || code === 'Space') {
        select(i)
      }
    }
  }
</script>

{#if tabs?.length}
  <div class="root" class:has-collapsed={collapsed}>
    <nav on:dblclick={toggleCollapse}>
      <ul>
        {#each tabs as { name }, i}
          {#if tabEnability[i]}
            <li
              class:current={i === selected}
              role="tab"
              on:keydown={makeKeyHandler(i)}
              on:click={() => select(i)}
            >
              {name}
            </li>
          {/if}
        {/each}
        <li>
          <slot />
          <Button
            noColor
            title={$_('tooltip.collapsible')}
            on:click={toggleCollapse}
            icon={collapsed ? 'expand_less' : 'expand_more'}
          />
        </li>
      </ul>
    </nav>
    <main class:collapsed bind:this={main}>
      {#each tabs as { component }, i}
        {#if i === selected}
          <svelte:component this={component} />
        {/if}
      {/each}
      {#if allDisabled}
        <PaneDisclaimer message={$_('message.no-pane-enabled')} />
      {/if}
    </main>
  </div>
{/if}

<style lang="postcss">
  .root {
    @apply px-4 pb-4;
  }

  nav {
    @apply select-none;
  }

  ul {
    @apply flex gap-6 w-full items-end cursor-pointer border-b border-$base;
  }

  li {
    @apply py-2;

    &:last-child {
      @apply flex-grow text-right px-2;
    }
  }

  .current {
    @apply text-$primary;
  }

  main {
    @apply m-2 pr-2 overflow-auto transition-all duration-300;
    max-height: 15vh;
    height: 15vh;

    &.collapsed {
      @apply max-h-0;
    }
  }
</style>
