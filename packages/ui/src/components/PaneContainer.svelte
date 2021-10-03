<script>
  import { _ } from 'svelte-intl'
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

  function select(i) {
    selected = i
  }

  function toggleCollapse() {
    collapsed = !collapsed
  }
</script>

<style type="postcss">
  .root {
    @apply flex flex-col w-full h-1/4;

    &.has-collapsed {
      @apply h-auto;
    }
  }

  ul {
    @apply flex border-b w-full cursor-pointer;
    border-bottom-color: theme('colors.primary.main');
  }

  li {
    @apply px-4 py-2;

    &:last-child {
      @apply flex-grow text-right;
    }
  }

  .current {
    color: theme('colors.secondary.text');
    background-color: theme('colors.primary.main');
  }

  .collapsed {
    @apply hidden;
  }

  .tab-content {
    @apply overflow-hidden;
  }
</style>

{#if tabs?.length}
  <div class="root" class:has-collapsed={collapsed}>
    <nav on:dblclick={toggleCollapse}>
      <ul>
        {#each tabs as { name }, i}
          {#if tabEnability[i]}
            <li class:current={i === selected} on:click={() => select(i)}>
              {name}
            </li>
          {/if}
        {/each}
        <li>
          <button title={$_('tooltip.collapsible')} on:click={toggleCollapse}
            ><span class="material-icons"
              >{collapsed ? 'expand_less' : 'expand_more'}</span
            ></button
          >
        </li>
      </ul>
    </nav>
    <main class:collapsed class="tab-content" bind:this={main}>
      {#each tabs as { component }, i}
        {#if i === selected}
          <svelte:component this={component} />
        {/if}
      {/each}
      {#if tabEnability.every(enabled => !enabled)}
        <PaneDisclaimer message={$_('message.no-pane-enabled')} />
      {/if}
    </main>
  </div>
{/if}
