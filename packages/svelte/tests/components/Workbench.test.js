import { render, screen } from '@testing-library/svelte'
import html from 'svelte-htm'
import TestButton from './TestButton.svelte'
import { Workbench } from '../../src'

describe('Workbench component', () => {
  it('can handle no tools', () => {
    render(html`<${Workbench} />`)
    expect(document.body.firstChild).toHaveTextContent('')
  })

  it('renders given tools', () => {
    const tools = [TestButton, TestButton]
    render(html`<${Workbench} tools=${tools} />`)
    expect(screen.queryAllByRole('button')).toHaveLength(2)
  })
})
