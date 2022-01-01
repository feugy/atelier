<script>
  import { createEventDispatcher } from 'svelte'

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

<style lang="postcss">
  .root {
    @apply p-4 overflow-auto w-full h-full grid auto-rows-min gap-y-2 gap-x-4 text-left;
    grid-template-columns: auto 1fr;
  }

  label {
    @apply text-right p-1;
    color: theme('colors.secondary.dark');
  }

  input,
  textarea {
    @apply px-2 py-1;
  }

  input[type='number'] {
    @apply justify-self-start;
    width: 4rem;
  }

  input[type='checkbox'] {
    @apply justify-self-start;
  }

  textarea {
    min-height: 150px;
  }
</style>

<div class="root">
  {#each entries as { name, value, type }}
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
    {/if}
  {/each}
</div>
