<script>
  import {
    afterUpdate,
    beforeUpdate,
    getContext,
    onDestroy,
    onMount
  } from 'svelte'
  import * as ToolBox from './ToolBox.svelte'
  import {
    registerTool,
    recordEvent,
    currentTool,
    recordVisibility
  } from '../stores'

  export let name
  if (!name) {
    throw new Error(`Tool needs a name property`)
  }
  export let props = {}
  export let events = []
  export let component = null
  export let setup = null
  export let teardown = null

  let instance
  let target
  let listeners = []
  let visible = false
  $: usesSlot = $$slots.default

  const toolBox = getContext(ToolBox.contextKey)
  if (toolBox?.component && component) {
    throw new Error(
      `Tool "${name}" does not support component property since its ToolBox "${toolBox.name}" already have one`
    )
  }
  const Component = toolBox?.component || component
  const fullName = toolBox?.name ? `${toolBox.name}/${name}` : name
  let allProps = { ...(toolBox?.props || {}), ...props }
  const allEvents = [...(toolBox?.events || []), ...events]
  const data = { ...(toolBox?.data ?? {}), ...$$restProps }

  onMount(() =>
    registerTool({
      name,
      fullName,
      props: allProps,
      events: allEvents,
      updateProperty,
      data
    })
  )

  beforeUpdate(() => {
    if (visible && $currentTool?.fullName !== fullName) {
      destroy()
    }
  })

  afterUpdate(async () => {
    if ($currentTool?.fullName === fullName && !visible) {
      let overrides = await toolBox?.setup?.({
        name,
        fullName,
        props: allProps
      })
      overrides = await setup?.({
        name,
        fullName,
        props: overrides || allProps
      })
      if (overrides) {
        allProps = overrides
      }
      visible = true
      if (!usesSlot && !instance && target && Component) {
        instance = new Component({ target, props: allProps })
        listeners = []
        for (const eventName of allEvents) {
          const handler = makeEventHandler(eventName)
          instance.$on(eventName, handler)
          listeners.push({ eventName, handler })
          target.addEventListener(eventName, handler)
        }
      }
      recordVisibility({ name, fullName, visible })
    }
  })

  onDestroy(destroy)

  async function destroy() {
    for (const { eventName, handler } of listeners) {
      target.removeEventListener(eventName, handler)
    }
    instance?.$destroy()
    instance = null
    listeners = []
    visible = false
    await teardown?.(fullName)
    await toolBox?.teardown?.(fullName)
    recordVisibility({ name, fullName, visible })
  }

  function makeEventHandler(name) {
    return (...args) => recordEvent(name, ...args)
  }

  function handleEvent(...args) {
    recordEvent(args[0].type, ...args)
  }

  function updateProperty(name, value) {
    if (instance) {
      instance.$set({ [name]: value })
    } else {
      allProps[name] = value
    }
  }
</script>

<style>
  .tool {
    display: none;
    flex-direction: column;
  }
  .tool.visible {
    display: flex;
  }
</style>

<span class="tool" class:visible data-full-name={encodeURIComponent(fullName)}>
  {#if usesSlot}
    {#if visible}
      <slot props={allProps} {handleEvent} />
    {/if}
  {:else}
    <span bind:this={target} />
  {/if}
</span>
