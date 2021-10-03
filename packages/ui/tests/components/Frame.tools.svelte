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

<ToolBox name="Components/Frame" props={{ src: 'index.html' }}>
  <Tool name="Full screen" let:props>
    <Frame bind:frame {...props} />
  </Tool>
  <Tool name="Centered" let:props>
    <Frame bind:frame layout="centered" {...props} />
  </Tool>
  <Tool name="Padded" let:props>
    <Frame bind:frame layout="padded" {...props} />
  </Tool>
</ToolBox>
