<script>
  import { Tool } from '@atelier-wb/svelte'
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

<Tool name="Components/Frame" props={{ src: 'index.html' }} let:props>
  <Frame bind:frame {...props} />
</Tool>
