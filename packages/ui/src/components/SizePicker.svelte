<script context="module">
  export const sizesSchema = {
    type: 'array',
    items: {
      type: 'object',
      required: ['icon', 'height', 'width'],
      properties: {
        icon: { type: 'string' },
        label: { type: 'string' },
        height: { type: 'number' },
        width: { type: 'number' }
      }
    }
  }
</script>

<script>
  import { createEventDispatcher } from 'svelte'
  import { _ } from 'svelte-intl'
  import Button from './Button.svelte'

  export let viewport = null
  export let sizes = [
    {
      icon: 'phone_android',
      label: $_('label.small-viewport'),
      height: 568,
      width: 320
    },
    {
      icon: 'stay_current_landscape',
      label: $_('label.medium-viewport'),
      height: 896,
      width: 414
    },
    {
      icon: 'tablet_android',
      label: $_('label.large-viewport'),
      height: 1112,
      width: 834
    }
  ]

  let parentClass = 'frame'
  let isRotated = false
  let currentSize = null

  const dispatch = createEventDispatcher()
  const resetOption = {
    icon: 'clear',
    label: $_('label.reset-viewport'),
    isReset: true
  }
  const rotateOption = {
    icon: 'screen_rotation',
    label: $_('label.rotate-viewport'),
    isRotate: true
  }

  $: options = [...(currentSize ? [resetOption, rotateOption] : []), ...sizes]

  function handleSelect(option) {
    if (!viewport) {
      return
    }
    if (option.isReset) {
      reset()
    } else if (option.isRotate) {
      rotate()
    } else {
      apply(option)
    }
    dispatch('select', currentSize)
  }

  function apply(option) {
    currentSize = option
    viewport.style.width = `${isRotated ? option.height : option.width}px`
    viewport.style.height = `${isRotated ? option.width : option.height}px`
    viewport.parentElement.classList.add(parentClass)
  }

  function reset() {
    currentSize = null
    viewport.style.width = '100%'
    viewport.style.height = '100%'
    viewport.parentElement.classList.remove(parentClass)
  }

  function rotate() {
    isRotated = !isRotated
    const { width, height } = viewport.style
    viewport.style.width = height
    viewport.style.height = width
  }

  function makeTooltip(option) {
    return [
      option.label,
      option.width ? `[${option.width} x ${option.height}]` : ''
    ]
      .filter(Boolean)
      .join(' ')
  }
</script>

<div role="toolbar">
  {#each options as option}
    <Button
      icon={option.icon}
      primary={true}
      noColor={currentSize !== option}
      title={makeTooltip(option)}
      on:click={() => handleSelect(option)}
    />
  {/each}
</div>

<style lang="postcss">
  div {
    @apply inline-flex;
  }
</style>
