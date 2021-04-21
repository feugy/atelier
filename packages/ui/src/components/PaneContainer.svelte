<script>
  import { beforeUpdate } from 'svelte'
  import { _ } from 'svelte-intl'

  export let tabs = []
  export let currentIdx = 0
  let main
  let content
  let collapsed = false
  let instance = null

  beforeUpdate(() => {
    instance?.$destroy()
    instance = null
    if (tabs?.[currentIdx]?.content && main) {
      content = tabs[currentIdx].content
      if (typeof content === 'function') {
        instance = new content({
          target: main,
          props: tabs[currentIdx].props
        })
        for (const [event, handler] of Object.entries(
          tabs[currentIdx].events || {}
        )) {
          instance.$on(event, handler)
        }
        content = null
      }
    }
  })

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
    <main class:collapsed class="tab-content" bind:this={main}>
      {content || ''}
    </main>
  </div>
{/if}
