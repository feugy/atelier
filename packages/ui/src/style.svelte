<style global type="postcss">
  @import 'material-design-icons-iconfont';

  @tailwind base;

  .material-icons {
    vertical-align: -0.2em;
  }

  html,
  body {
    @apply font-sans h-full overflow-hidden m-0;
    color: theme('colors.primary.text');
    background-color: theme('background.page');
  }

  body {
    @apply flex;
  }

  button {
    @apply outline-none;
    transition: transform 250ms;

    &:focus,
    &:hover {
      transform: scale(1.2);
    }
  }

  .tool.documented {
    @apply p-4;

    & .tool-preview {
      @apply my-4 bg-white p-2 shadow-md;
    }
  }
</style>
