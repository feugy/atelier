<script>
  import { _ } from 'svelte-intl'
  import Button from './Button.svelte'

  export let viewport = null

  let isViewPortActive = false
  let viewPortWidth = 1112
  let viewPortHeight = 832

  const backgrounds = ['', 'white', 'black']
  let currentBackground = 0

  $: if (viewport && isViewPortActive) {
    const width = parseInt(viewPortWidth)
    const height = parseInt(viewPortHeight)
    if (!isNaN(width) && !isNaN(height) && width > 10 && height > 10) {
      viewPortWidth = width
      viewPortHeight = height
      viewport.style.width = `${viewPortWidth}px`
      viewport.style.height = `${viewPortHeight}px`
    }
  }

  function toggleViewPort() {
    if (!viewport) {
      return
    }
    isViewPortActive = !isViewPortActive
    const { style, parentElement } = viewport
    if (isViewPortActive) {
      style.width = `${viewPortWidth}px`
      style.height = `${viewPortHeight}px`
      parentElement.classList.add('frame')
    } else {
      style.width = '100%'
      style.height = '100%'
      parentElement.classList.remove('frame')
    }
  }

  function invertViewPort() {
    // eslint-disable-next-line no-extra-semi
    ;[viewPortWidth, viewPortHeight] = [viewPortHeight, viewPortWidth]
  }

  function cycleBackgrounds() {
    currentBackground = (currentBackground + 1) % backgrounds.length
    if (viewport) {
      viewport.style.backgroundColor = backgrounds[currentBackground]
      viewport.style.backgroundImage = currentBackground === 0 ? '' : 'none'
    }
  }
</script>

<style lang="postcss">
  nav {
    @apply w-full px-4 text-center;
  }
  ul {
    @apply inline-flex;
    & > li {
      @apply px-2;
    }
  }
  input {
    @apply w-10 border bg-transparent outline-none;

    &.width {
      @apply text-right;
    }
  }

  .input-bar {
    white-space: nowrap;
  }
</style>

<nav>
  <ul>
    <li>
      <Button
        title={$_('tooltip.background')}
        icon="wallpaper"
        primary={true}
        noColor={true}
        on:click={cycleBackgrounds}
      />
    </li>
    <li>
      <Button
        title={$_('tooltip.viewport')}
        icon="devices"
        primary={true}
        noColor={true}
        on:click={toggleViewPort}
      />
      {#if isViewPortActive}
        <span class="input-bar">
          <input class="width" bind:value={viewPortWidth} />
          <button on:click={invertViewPort}
            ><span class="material-icons">swap_horiz</span></button
          >
          <input class="height" bind:value={viewPortHeight} />
        </span>
      {/if}
    </li>
  </ul>
</nav>
