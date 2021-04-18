<script>
  import { afterUpdate, beforeUpdate, getContext, onMount } from 'svelte'
  import * as ToolBox from './ToolBox.svelte'
  import { registerTool, recordEvent, currentTool } from './stores'

  export let name
  export let props
  export let events = []
  export let component = null
  const target = document.body
  let instance
  let listeners = []

  const toolBox = getContext(ToolBox.contextKey)
  const Component = toolBox?.component || component
  const fullName = toolBox ? `${toolBox.name}/${name}` : name

  onMount(() => registerTool({ name: fullName }))

  beforeUpdate(() => {
    if ($currentTool?.name !== fullName && instance) {
      for (const { eventName, handler } of listeners) {
        target.removeEventListener(eventName, handler)
      }
      instance.$destroy()
      instance = null
      listeners = []
    }
  })

  afterUpdate(() => {
    if ($currentTool?.name === fullName && !instance) {
      instance = new Component({ target, props, hydrate: true })
      listeners = []
      for (const eventName of [...(toolBox ? toolBox.events : []), ...events]) {
        const handler = makeEventHandler(eventName)
        instance.$on(eventName, handler)
        listeners.push({ eventName, handler })
        target.addEventListener(eventName, handler)
      }
    }
  })

  function makeEventHandler(name) {
    return (...args) => recordEvent(name, ...args)
  }
</script>
