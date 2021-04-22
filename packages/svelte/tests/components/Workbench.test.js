import { render, screen } from '@testing-library/svelte'
import html from 'svelte-htm'
import { Button } from '../test-components'
import { Workbench } from '../../src'

describe('Workbench component', () => {
  beforeEach(jest.resetAllMocks)

  it('can handle no tools', () => {
    render(html`<${Workbench} />`)
    expect(document.body.firstChild).toHaveTextContent('')
  })

  it('renders given tools', () => {
    render(html`<${Workbench} tools=${[Button, Button]} />`)
    expect(screen.queryAllByRole('button')).toHaveLength(2)
  })
})
