<script>
  import { createEventDispatcher } from 'svelte'

  export let label = 'Hey oh!'
  export let disabled = false
  const dispatch = createEventDispatcher()
</script>

<button {disabled} on:mouseenter={() => dispatch('enter')}>{label}</button>
