<script>
  import Dropdown from '../../../src/components/Dropdown.svelte'
  import { lorem } from '../../test-utils.js'

  export let align = 'text-center'
  export let parentPosition = 'inherited'
  let value
</script>

<div>current value is: {(value && value.label) || value}</div>
<div class={align} style={`position: ${parentPosition}`}>
  <Dropdown bind:value {...$$props} on:select />
</div>
<p>{lorem.join('\n')}</p>
<p>{lorem.join('\n')}</p>
