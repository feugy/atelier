<script>
  export let text = null
</script>

<button on:click {...$$restProps}>
  {#if text}<span>{text}</span>{/if}
</button>

<style lang="postcss">
  button {
    display: inline-flex;
    background-color: purple;
    border: none;
    color: white;
    padding: 1em 1.5em;
    align-items: center;
    text-transform: capitalize;
    transform: all 250ms;
    white-space: nowrap;
  }

  button:not(:disabled) {
    cursor: pointer;
  }
  button:not(:disabled):hover {
    background-color: violet;
    transform: scale(1.05, 1.05);
  }
</style>
