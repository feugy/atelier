<script>
  import { onMount } from 'svelte'
  import { _ } from 'svelte-intl'
  import * as EventsPane from './EventsPane.svelte'
  import * as PropertiesPane from './PropertiesPane.svelte'
  import ErrorDialogue from './ErrorDialogue.svelte'
  import '../common'
  import { Aside, Frame, Loader, PaneContainer, Toolbar } from '../components'
  import {
    currentTool,
    events,
    selectTool,
    setWorkbenchFrame,
    tools
  } from '../stores'

  let frame
  let viewport
  let loading = true

  onMount(() => setWorkbenchFrame(frame))

  function handleFrameLoaded() {
    loading = false
  }
</script>

<style lang="postcss">
  main {
    @apply flex-grow flex flex-col overflow-auto;
  }

  .viewport-container {
    @apply flex p-4 overflow-auto flex-grow items-center;
  }

  .viewport {
    @apply relative flex-grow h-full shadow-xl transition-all border border-$base-dark;
  }

  :global(.viewport-container.frame > .viewport) {
    @apply flex-none m-auto;
  }

  .loader {
    @apply absolute invert-0 h-full w-full flex items-center justify-center;
  }
</style>

<svelte:head>
  <title>{$_('title.app')}</title>
</svelte:head>

<Aside
  tools={$tools}
  current={$currentTool}
  on:select={({ detail }) => selectTool(detail)}
>
  <Toolbar {viewport} />
</Aside>
<main>
  <span class="viewport-container">
    <div class="viewport" bind:this={viewport}>
      {#if loading}<div class="loader"><Loader /></div>{/if}
      <Frame
        bind:frame
        on:error={handleFrameLoaded}
        on:load={handleFrameLoaded}
      />
    </div>
  </span>
  <PaneContainer
    {currentTool}
    {events}
    tabs={[
      {
        name: $_('tab.properties'),
        isEnabled: PropertiesPane.isEnabled,
        component: PropertiesPane.default
      },
      {
        name: $_('tab.events'),
        isEnabled: EventsPane.isEnabled,
        component: EventsPane.default
      }
    ]}
  />
</main>
<ErrorDialogue />
