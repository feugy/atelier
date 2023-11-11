import { cleanup, render, screen } from '@testing-library/svelte'
import html from 'svelte-htm'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { Workbench } from '../../src'
import { currentTool } from '../../src/stores'
import { Button } from '../test-components'

vi.mock('../../src/stores', async () => {
  const { writable } = await import('svelte/store')
  return {
    currentTool: new writable()
  }
})

describe('Workbench component', () => {
  beforeEach(() => vi.resetAllMocks())
  afterEach(cleanup)

  it('can handle no tools', () => {
    render(html`<${Workbench} />`)
    expect(document.body.firstChild).toHaveTextContent('')
  })

  it('renders given tools', () => {
    render(html`<${Workbench} tools=${[Button, Button]} />`)
    expect(screen.queryAllByRole('button')).toHaveLength(2)
  })

  it('has fullscreen layout by default', () => {
    render(html`<${Workbench} tools=${[Button]} />`)
    expect(screen.getByRole('region')).toHaveClass('fullscreen')
  })

  it('uses current tool layout', () => {
    const layout = 'centered'
    currentTool.set({ data: { layout } })
    render(html`<${Workbench} tools=${[Button]} />`)
    expect(screen.getByRole('region')).toHaveClass('centered')
    expect(screen.getByRole('region')).not.toHaveClass('fullscreen')
  })
})
