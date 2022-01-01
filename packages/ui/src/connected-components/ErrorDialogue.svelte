<script>
  import { _ } from 'svelte-intl'
  import { Dialogue } from '../components'
  import { lastError } from '../stores'
</script>

{#if $lastError}
  <Dialogue title={$_('title.error')}>
    <main>{$lastError.message}</main>
    <div slot="footer" class="text-sm">
      {$_('message.fix-and-reload')}
    </div>
  </Dialogue>
{/if}
