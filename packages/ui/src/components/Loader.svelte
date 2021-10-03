<style type="postcss">
  svg {
    @apply inline-block w-10 h-10 m-4 animate-spin;
  }

  circle {
    stroke: theme('colors.primary.main');
    stroke-dasharray: 80px, 200px;
    stroke-dashoffset: 0px;
  }
</style>

<svg role="progress" viewBox="22 22 44 44">
  <circle cx="44" cy="44" r="20.2" fill="none" stroke-width="3.6" />
</svg>
