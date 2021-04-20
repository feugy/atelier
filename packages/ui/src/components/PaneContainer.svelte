<script>
  import { _ } from 'svelte-intl'

  export let tabs = []
  export let currentIdx = 0
  let collapsed = false

  $: tabContent = tabs?.[currentIdx]?.content
  $: contentProps = tabs?.[currentIdx]?.props || {}

  function select(i) {
    currentIdx = i
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
          <li class:current={i === currentIdx} on:click={() => select(i)}>
            {name}
          </li>
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
    <main class:collapsed class="tab-content">
      {#if typeof tabContent === 'function'}
        <svelte:component this={tabContent} {...contentProps} />
      {:else}
        {tabContent}
      {/if}
    </main>
  </div>
{/if}
