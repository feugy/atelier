<script>
  import { Tool, ToolBox } from '@atelier-wb/svelte'
  import { tick } from 'svelte'
  import { _ } from 'svelte-intl'
  import SizePicker from '../../src/components/SizePicker.svelte'

  let viewport
  let width = '100%'
  let height = '100%'

  async function handleSelect() {
    await tick()
    width = viewport.style.width
    height = viewport.style.height
  }
</script>

<ToolBox name="Components/Size Picker 2" events={['select']} layout="centered">
  <Tool name="Default values" let:handleEvent>
    <SizePicker on:select={handleEvent} on:select={handleSelect} {viewport} />
    <div>
      <span bind:this={viewport} />
      <div>width: {width}</div>
      <div>height: {height}</div>
    </div>
  </Tool>

  <Tool
    name="Custom values"
    props={{
      sizes: [
        {
          icon: 'laptop',
          label: $_('label.medium-viewport'),
          height: 480,
          width: 320
        },
        {
          icon: 'border_outer',
          label: $_('label.medium-viewport'),
          height: 800,
          width: 480
        }
      ]
    }}
    let:props
    let:handleEvent
  >
    <SizePicker
      {...props}
      on:select={handleEvent}
      on:select={handleSelect}
      {viewport}
    />
    <div>
      <span bind:this={viewport} />
      <div>width: {width}</div>
      <div>height: {height}</div>
    </div>
  </Tool>
</ToolBox>
