<script>
  import { Tool, ToolBox } from '@atelier/svelte'
  import EventLogger from '../src/components/EventLogger.svelte'
</script>

<ToolBox name="Components/Event logger" component={EventLogger}>
  <Tool
    name="With events"
    props={{
      events: [
        { name: 'simple', args: ['hello!'], time: 1618752854000 },
        { name: 'multiple', args: [1, true, 'hi'], time: 1618740000000 },
        {
          name: 'DOM event',
          args: [new CustomEvent('cat', { detail: { hazcheeseburger: true } })],
          time: 1618760706000
        }
      ]
    }}
  />

  <Tool name="Empty" />
</ToolBox>
