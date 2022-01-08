<script>
  import { onMount } from 'svelte'
  import { _ } from 'svelte-intl'
  import * as EventsPane from './EventsPane.svelte'
  import * as PropertiesPane from './PropertiesPane.svelte'
  import ErrorDialogue from './ErrorDialogue.svelte'
  import '../common'
  import {
    Aside,
    BackgroundPicker,
    Explorer,
    Frame,
    PaneContainer,
    SizePicker
  } from '../components'
  import {
    currentTool,
    events,
    getSettings,
    selectTool,
    setWorkbenchFrame,
    tools
  } from '../stores'

  let frame
  let viewport

  const sizes = getSettings('sizes')
  const backgrounds = getSettings('backgrounds')

  onMount(() => setWorkbenchFrame(frame))
</script>

<style lang="postcss">
  main {
    @apply flex-grow flex flex-col overflow-auto z-0;
  }
  div {
    @apply inline-flex gap-8 items-center mr-4;
  }
</style>

<svelte:head>
  <title>{$_('title.app')}</title>
</svelte:head>

<Aside>
  <Explorer
    tools={$tools}
    current={$currentTool}
    on:select={({ detail }) => selectTool(detail)}
  />
</Aside>
<main>
  <Frame bind:frame bind:viewport />
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
  >
    <div>
      <SizePicker {viewport} sizes={$sizes} />
      <BackgroundPicker {viewport} backgrounds={$backgrounds} />
    </div>
  </PaneContainer>
</main>
<ErrorDialogue />
