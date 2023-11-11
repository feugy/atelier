<script>
  import { Tool, ToolBox } from '@atelier-wb/svelte'

  import BackgroundPicker from '../../src/components/BackgroundPicker.svelte'

  let viewport
</script>

<ToolBox
  name="Components/Background Picker"
  events={['select']}
  layout="centered"
>
  <Tool name="Default colors" let:handleEvent>
    <BackgroundPicker on:select={handleEvent} {viewport} />
    <span bind:this={viewport} />
  </Tool>

  <Tool
    name="Custom colors"
    props={{
      backgrounds: [
        '',
        '#e879f9',
        'rgba(150, 75, 50, 0.5)',
        'linear-gradient(to right, red, orange)'
      ]
    }}
    let:props
    let:handleEvent
  >
    <BackgroundPicker {...props} on:select={handleEvent} {viewport} />
    <span bind:this={viewport} />
  </Tool>
</ToolBox>

<style lang="postcss">
  span {
    @apply inline-block w-10 h-10 m-4;
  }
</style>
