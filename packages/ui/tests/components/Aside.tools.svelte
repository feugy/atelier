<script>
  import { Tool } from '@atelier-wb/svelte'
  import Aside from '../../src/components/Aside.svelte'
</script>

<Tool
  name="Components/Aside"
  component={Aside}
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
  events={['select']}
/>
