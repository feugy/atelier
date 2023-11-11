import Button from './Button.svelte'

const app = new Button({
  target: document.getElementById('app'),
  props: { text: 'Hello!' }
})

export default app
