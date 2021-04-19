<script>
  import { Tool, ToolBox } from '@atelier/svelte'
  import Group from '../../src/components/Group.svelte'
</script>

<ToolBox name="Components/Group" events={['select']} component={Group}>
  <Tool
    name="Single level"
    props={{
      toolsGroup: new Map([
        ['Component #1', 1],
        ['Component #2', 2],
        ['Component #3', 3]
      ])
    }}
  />

  <Tool
    name="Multiple level"
    props={{
      toolsGroup: new Map([
        ['Component #3', 3],
        [
          'Folder A',
          new Map([
            [
              'Folder B',
              new Map([
                ['Component #1', 1],
                ['Component #2', 2]
              ])
            ]
          ])
        ],
        [
          'Folder C',
          new Map([
            ['Component #3', 1],
            ['Component #4', 2]
          ])
        ]
      ])
    }}
  />

  <Tool name="No tabs" />
</ToolBox>
