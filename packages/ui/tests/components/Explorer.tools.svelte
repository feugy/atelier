<script>
  import { Tool, ToolBox } from '@atelier-wb/svelte'

  import Explorer from '../../src/components/Explorer/Explorer.svelte'
</script>

<ToolBox
  name="Components/Explorer"
  events={['select']}
  component={Explorer}
  layout="padded"
>
  <Tool
    name="Single level"
    props={{
      tools: [
        { fullName: 'Component #1' },
        { fullName: 'Component #2' },
        { fullName: 'Component #3' }
      ]
    }}
  />

  <Tool
    name="Multiple levels"
    props={{
      tools: [
        { fullName: 'Component #3' },
        {
          fullName: 'Folder A',
          children: [
            {
              fullName: 'Folder A/Folder B',
              children: [
                { fullName: 'Folder A/Folder B/Component #1' },
                { fullName: 'Folder A/Folder B/Component #2' },
                {
                  fullName: 'Folder A/Folder B/Folder C',
                  children: [
                    { fullName: 'Folder A/Folder B/Folder C/Component #3' },
                    { fullName: 'Folder A/Folder B/Folder C/Component #4' }
                  ]
                }
              ]
            }
          ]
        },
        {
          fullName: 'Folder D',
          children: [
            { fullName: 'Folder D/Component #6' },
            { fullName: 'Folder D/Component #5' }
          ]
        }
      ]
    }}
  />
</ToolBox>
