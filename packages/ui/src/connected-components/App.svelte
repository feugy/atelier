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
  $: if ($currentTool) {
    loading = false
  }
  $: console.log('loading', loading)

  onMount(() => setWorkbenchFrame(frame))
</script>

<style type="postcss">
  main {
    @apply flex-grow flex flex-col overflow-hidden;
  }

  .viewport {
    @apply flex-grow overflow-auto text-center;
    background-image: radial-gradient(
      theme('colors.secondary.light') 0.5px,
      transparent 1px
    );
    background-size: 20px 20px;
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
  <div class="viewport" bind:this={viewport}>
    {#if loading}<Loader />{/if}
    <Frame bind:frame layout={$currentTool?.data?.layout} />
  </div>
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
