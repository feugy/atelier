import { describe, expect, it } from 'vitest'
import { buildWorkframeContent } from '../workframe-content.js'

describe('buildWorkFrameContent()', () => {
  it('instanciate Workbench with provided tools', async () => {
    const tools = ['tool1', 'tool3', 'tool2']
    const imports = [
      `import { tool1, tool2 } from 'a.tools.svelte'`,
      `import tool3 from 'folder1/b.tools.svelte'`
    ]

    expect(await buildWorkframeContent({ tools, imports }))
      .toEqual(`import { Workbench } from '@atelier-wb/svelte'

import { tool1, tool2 } from 'a.tools.svelte'
import tool3 from 'folder1/b.tools.svelte'

new Workbench({
  target: document.body,
  props: { tools: [tool1, tool3, tool2] }
})`)
  })
})
