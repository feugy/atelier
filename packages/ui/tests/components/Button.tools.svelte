<script>
  import { Tool, ToolBox } from '@atelier-wb/svelte'
  import Button from '../../src/components/Button.svelte'
</script>

<ToolBox
  name="Components/Button"
  component={Button}
  events={['click']}
  layout="centered"
>
  <Tool name="Default" props={{ text: 'Default' }} />

  <Tool name="Disabled" props={{ text: 'Disabled', disabled: true }} />

  <Tool name="No color" props={{ text: 'Text only', noColor: true }} />

  <Tool name="Text and icon" props={{ text: 'Hello', icon: 'face' }} />

  <Tool name="Icon only" props={{ icon: 'face' }} />

  <Tool name="Icon only, no color" props={{ icon: 'face', noColor: true }} />

  <Tool name="Primary" props={{ text: 'Primary', primary: true }} />

  <Tool
    name="Primary disabled"
    props={{ text: 'Primary', primary: true, disabled: true }}
  />

  <Tool
    name="Primary with text and icon"
    props={{ text: 'Hey!', icon: 'person', primary: true }}
  />

  <Tool
    name="Primary with icon only"
    props={{ icon: 'volume_up', primary: true }}
  />

  <Tool
    name="Primary with icon only, no color"
    props={{ icon: 'volume_up', primary: true, noColor: true }}
  />
</ToolBox>
