<script>
  import { Tool, ToolBox } from '@atelier-wb/svelte'
  import Button from '../src/Button.svelte'
</script>

<ToolBox
  name="Components/Button"
  component={Button}
  events={['click']}
  layout="centered"
>
  <Tool name="Default" props={{ text: 'click me!' }} />

  <Tool name="Disabled" props={{ text: 'I am disabled', disabled: true }} />
</ToolBox>
