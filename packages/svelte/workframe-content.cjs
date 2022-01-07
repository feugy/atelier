// Invoked by vite-plugin-atelier to populates the workframe's content.
async function buildWorkframeContent({ tools, imports }) {
  return `import { Workbench } from '@atelier-wb/svelte'

${imports.join('\n')}

new Workbench({
  target: document.body,
  props: { tools: [${tools.join(', ')}] }
})`
}

module.exports = { buildWorkframeContent }
