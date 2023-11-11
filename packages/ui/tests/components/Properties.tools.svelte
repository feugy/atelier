<script>
  import { Tool, ToolBox } from '@atelier-wb/svelte'

  import { Properties } from '../../src/components'
</script>

<ToolBox
  name="Components/Properties"
  component={Properties}
  events={['prop-change']}
>
  <Tool
    name="Native types"
    props={{
      properties: {
        name: 'Jane',
        age: 28,
        hasSigned: true
      }
    }}
  />

  <Tool
    name="Arrays"
    props={{
      properties: {
        numbers: [1, 2],
        strings: ['a', 'b', 'c'],
        empty: []
      }
    }}
  />

  <Tool
    name="Objects"
    props={{
      properties: {
        numbers: { foo: 1, bar: 2 },
        strings: { foo: 'a', bar: { baz: 'b', toz: 'c' } },
        empty: {}
      }
    }}
  />
</ToolBox>
