<script>
  import { Tool, ToolBox } from '@atelier/svelte'
  import EventLogger from '../../src/components/EventLogger.svelte'
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
          args: [
            {
              altKey: false,
              button: 0,
              buttons: 0,
              cancelable: true,
              clientX: 123,
              clientY: 61,
              ctrlKey: false,
              currentTarget: {},
              defaultPrevented: false,
              detail: 1,
              layerX: 123,
              layerY: 61,
              metaKey: false,
              movementX: 0,
              movementY: 0,
              offsetX: 123,
              offsetY: 18,
              pageX: 123,
              pageY: 61,
              relatedTarget: null,
              screenX: 2267,
              screenY: 135,
              shiftKey: false,
              target: {
                __svelte_meta: {
                  loc: {
                    file: 'src/components/PaneContainer.svelte',
                    line: 77,
                    column: 4,
                    char: 1396
                  }
                }
              },
              type: 'click',
              which: 1
            }
          ],
          time: 1618760706000
        }
      ]
    }}
  />

  <Tool name="Empty" />
</ToolBox>
