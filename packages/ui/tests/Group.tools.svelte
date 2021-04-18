<script>
  import { Tool } from '@atelier/svelte'
  import Group from '../src/components/Group.svelte'
</script>

<Tool name="Components/Group/Single level">
  <Group
    toolsGroup={new Map([
      ['Component #1', 1],
      ['Component #2', 2],
      ['Component #3', 3]
    ])}
  />
</Tool>

<Tool name="Components/Group/Multiple levels">
  <Group
    toolsGroup={new Map([
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
    ])}
  />
</Tool>

<Tool name="Components/Group/No input">
  <Group />
</Tool>
