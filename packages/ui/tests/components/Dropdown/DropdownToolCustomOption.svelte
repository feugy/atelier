<script>
  import { createEventDispatcher } from 'svelte'

  export let onValueSet = () => {}
  export let text
  const dispatch = createEventDispatcher()

  function handleChange(evt) {
    onValueSet(evt.target.value)
    dispatch('close')
  }
</script>

<span class="pr-2">{text}</span>
<input type="text" on:change={handleChange} />
