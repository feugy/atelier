<script>
  import { Tool } from '@atelier-wb/svelte'

  import Dialogue from '../../src/components/Dialogue.svelte'
  import { lorem } from '../test-utils.js'
</script>

<Tool
  name="Components/Dialogue"
  props={{ open: true, title: 'Greetings' }}
  let:props
>
  {#each lorem as text}
    <p>{text}</p>
  {/each}
  <Dialogue {...props}>
    <div slot="footer" class="text-right">-- Damien</div>
    <span class="text-xl">Hello world!</span>
  </Dialogue>
</Tool>
