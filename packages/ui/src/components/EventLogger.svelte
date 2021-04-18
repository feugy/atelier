<script>
  import { _ } from 'svelte-intl'
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
    @apply p-4 overflow-auto w-full h-full text-center;
  }

  .log {
    @apply grid gap-y-1 gap-x-4 items-center text-left;
    grid-template-columns: auto auto 1fr;
  }

  .time {
    @apply text-sm;
    color: theme('colors.secondary.dark');
  }

  .name {
    @apply justify-self-end;
    color: theme('colors.primary.dark');
  }

  .disclaimer {
    @apply italic;
    color: theme('colors.secondary.dark');
  }
</style>

<div class="root">
  {#if !events?.length}
    <div class="disclaimer">{$_('message.no-events')}</div>
  {:else}
    <div class="log">
      {#each events as { name, args, time }}
        <div class="time">
          {$_('{ value, time }', { value: time })}
        </div>
        <div class="name">{name}</div>
        <div class="args">{format(args)}</div>
      {/each}
    </div>
  {/if}
</div>
