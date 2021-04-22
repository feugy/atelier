<script>
  import { _ } from 'svelte-intl'
  import PaneDisclaimer from './PaneDisclaimer.svelte'

  export let events = []

  function format(arg) {
    if (Array.isArray(arg)) {
      return arg.map(format).join(', ')
    }
    if (typeof arg === 'object') {
      return JSON.stringify(arg, null, 2)
    }
    return arg
  }
</script>

<style type="postcss">
  .root {
    @apply p-4 overflow-auto w-full h-full;
  }

  .log {
    @apply grid gap-y-1 gap-x-4;
    grid-template-columns: auto auto 1fr;
  }

  .time {
    @apply text-xs leading-6;
    color: theme('colors.secondary.dark');
  }

  .name {
    @apply justify-self-end;
    color: theme('colors.primary.dark');
  }
</style>

<div class="root">
  {#if !events?.length}
    <PaneDisclaimer message={$_('message.no-events')} />
  {:else}
    <div class="log">
      {#each events as { name, args, time }}
        <div class="time">
          {$_('{ time, time }', { time })}
        </div>
        <div class="name">{name}</div>
        <div class="args">{format(args)}</div>
      {/each}
    </div>
  {/if}
</div>
