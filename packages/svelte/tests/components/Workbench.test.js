import { render, screen } from '@testing-library/svelte'
import html from 'svelte-htm'
import { Button } from '../test-components'
import { Workbench } from '../../src'
import { currentTool } from '../../src/stores'

vi.mock('../../src/stores', () => {
  const { writable } = require('svelte/store')
  return {
    currentTool: new writable()
  }
})

describe('Workbench component', () => {
  beforeEach(vi.resetAllMocks)

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
