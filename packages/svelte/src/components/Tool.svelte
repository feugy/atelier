<script>
  import {
    afterUpdate,
    beforeUpdate,
    getContext,
    onDestroy,
    onMount
  } from 'svelte'
  import * as ToolBox from './ToolBox.svelte'
  import { registerTool, recordEvent, currentTool } from '../stores'

  export let name
  if (!name) {
    throw new Error(`Tool needs a name property`)
  }
  export let props = {}
  export let events = []
  export let component = null
  const target = document.body
  let instance
  let listeners = []

  const toolBox = getContext(ToolBox.contextKey)
  if (toolBox?.component && component) {
    throw new Error(
      `Tool "${name}" does not support component property since its ToolBox "${toolBox.name}" already have one`
    )
  }
  const Component = toolBox?.component || component
  const fullName = toolBox?.name ? `${toolBox.name}/${name}` : name
  const allProps = { ...(toolBox?.props || {}), ...props }
  const allEvents = [...(toolBox?.events || []), ...events]

  onMount(() =>
    registerTool({
      name: fullName,
      props: allProps,
      events: allEvents,
      updateProperty
    })
  )

  beforeUpdate(() => {
    if ($currentTool?.name !== fullName && instance) {
      destroy()
    }
  })

  afterUpdate(() => {
    if ($currentTool?.name === fullName && !instance && Component) {
      instance = new Component({ target, props: allProps })
      listeners = []
      for (const eventName of allEvents) {
        const handler = makeEventHandler(eventName)
        instance.$on(eventName, handler)
        listeners.push({ eventName, handler })
        target.addEventListener(eventName, handler)
      }
    }
  })

  onDestroy(destroy)

  function destroy() {
    for (const { eventName, handler } of listeners) {
      target.removeEventListener(eventName, handler)
    }
    instance?.$destroy()
    instance = null
    listeners = []
  }

  function makeEventHandler(name) {
    return (...args) => recordEvent(name, ...args)
  }

  function updateProperty(name, value) {
    instance?.$set({ [name]: value })
  }
</script>
