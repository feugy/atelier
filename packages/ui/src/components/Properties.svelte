<script>
  import { createEventDispatcher } from 'svelte'
  import { fade } from 'svelte/transition'

  export let properties = {}
  let entries = []

  const dispatch = createEventDispatcher()
  $: entries = Object.entries(properties || {}).map(analyze)

  function analyze([name, value]) {
    const type =
      typeof value === 'number'
        ? 'number'
        : typeof value === 'boolean'
        ? 'boolean'
        : Array.isArray(value) || typeof value === 'object'
        ? 'object'
        : 'text'
    if (type === 'object') {
      value = JSON.stringify(value, null, 2)
    }
    return { name, type, value }
  }

  function makeNumberChangeHandler(name) {
    return ({ target: { value } }) =>
      dispatch('prop-change', { name, value: +value })
  }

  function makeBooleanChangeHandler(name) {
    return ({ target: { checked } }) =>
      dispatch('prop-change', { name, value: checked })
  }

  function makeStringChangeHandler(name) {
    return ({ target: { value } }) => dispatch('prop-change', { name, value })
  }

  function makeObjectChangeHandler(name) {
    return ({ target: { value } }) => {
      try {
        const parsed = JSON.parse(value)
        dispatch('prop-change', { name, value: parsed })
      } catch {
        // ignores error
      }
    }
  }
</script>

<div class="root">
  {#each entries as { name, value, type }}
    <span in:fade|local>
      <label for={name}>{name}</label>
      {#if type === 'number'}
        <input
          type="number"
          id={name}
          {value}
          on:change={makeNumberChangeHandler(name)}
        />
      {:else if type === 'boolean'}
        <input
          type="checkbox"
          id={name}
          checked={value}
          on:change={makeBooleanChangeHandler(name)}
        />
      {:else if type === 'object'}
        <textarea id={name} {value} on:input={makeObjectChangeHandler(name)} />
      {:else}
        <input id={name} {value} on:input={makeStringChangeHandler(name)} />
      {/if}</span
    >
  {/each}
</div>

<style lang="postcss">
  .root {
    @apply grid overflow-y-auto overflow-x-hidden gap-4 h-full;
    grid-template-columns: repeat(auto-fill, 300px);
  }

  label {
    @apply capitalize text-$base-lightest py-2 pr-2;
  }

  span {
    @apply flex items-start;
  }

  input,
  textarea {
    @apply p-2 bg-transparent border border-$base flex-grow min-w-0;
  }

  input[type='number'] {
  }

  input[type='checkbox'] {
    @apply cursor-pointer mt-3 flex-grow-0;
  }

  textarea {
    @apply resize-y h-full;
  }
</style>
