<script>
  import { onMount } from 'svelte'
  import { _ } from 'svelte-intl'
  import * as EventsPane from './EventsPane.svelte'
  import * as PropertiesPane from './PropertiesPane.svelte'
  import '../common'
  import {
    Explorer,
    Frame,
    Loader,
    PaneContainer,
    Toolbar
  } from '../components'
  import {
    currentTool,
    events,
    selectTool,
    setWorkbenchFrame,
    toolsMap
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
    @apply flex overflow-auto flex-grow items-center;
  }

  .viewport {
    @apply relative flex-grow h-full;
    background-image: radial-gradient(
      theme('colors.secondary.light') 0.5px,
      transparent 1px
    );
    background-size: 20px 20px;
  }

  :global(.viewport-container.frame) {
    @apply p-8;
  }

  :global(.viewport-container.frame > .viewport) {
    @apply border flex-none m-auto;
    border-color: theme('colors.primary.main');
    border-style: solid !important;
  }

  .loader {
    @apply absolute invert-0 h-full w-full flex items-center justify-center;
  }
</style>

<svelte:head>
  <title>{$_('title.app')}</title>
</svelte:head>

<Explorer
  toolsGroup={$toolsMap}
  current={$currentTool}
  on:select={({ detail }) => selectTool(detail)}
>
  <Toolbar {viewport} />
</Explorer>
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
