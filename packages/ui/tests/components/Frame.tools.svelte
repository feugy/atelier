<script>
  import { Tool, ToolBox } from '@atelier-wb/svelte'
  import Frame from '../../src/components/Frame.svelte'

  let frame

  $: if (frame) {
    frame.contentWindow?.postMessage(
      {
        type: 'selectTool',
        data: { fullName: 'Components/Properties/Objects' }
      },
      new URL(frame.src).origin
    )
  }
</script>

<ToolBox
  name="Components/Frame"
  props={{ width: null, height: null, layout: 'fullscreen', src: 'index.html' }}
>
  <Tool name="Full screen" let:props>
    <Frame bind:frame {...props} />
  </Tool>

  <Tool name="Centered and constrained" let:props>
    <Frame bind:frame {...props} width={500} height={200} layout="centered" />
  </Tool>
</ToolBox>
