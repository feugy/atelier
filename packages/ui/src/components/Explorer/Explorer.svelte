<script>
  import { createEventDispatcher } from 'svelte'

  import BreadCrumb from './BreadCrumb.svelte'
  import ToolGroup from './ToolGroup.svelte'
  import { getParentName, isFolder } from './utils.js'

  export let tools = []
  export let current = null
  let moveForward = true

  const dispatch = createEventDispatcher()

  // trick to evaluate currentPath when tools have changed but current has not
  $: currentPath = tools ? getParentName(current?.fullName) : undefined

  function navigateTo({ detail: tool }) {
    if (isFolder(tool)) {
      currentPath = tool.fullName
      moveForward = true
    } else {
      current = tool
      dispatch('select', tool)
    }
  }

  function navigateBack({ detail: path }) {
    currentPath = path
    moveForward = false
  }
</script>

<BreadCrumb path={currentPath} on:navigate={navigateBack} />
<ToolGroup
  {tools}
  {currentPath}
  {moveForward}
  selectedPath={current?.fullName}
  on:select={navigateTo}
/>
