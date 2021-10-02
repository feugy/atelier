import { fireEvent, render, screen } from '@testing-library/svelte'
import html from 'svelte-htm'
import { translate } from '../test-utils'
import { Explorer } from '../../src/components'
import { groupByName } from '../../src/utils'

describe('Explorer and Group components', () => {
  const tools = [
    { fullName: 'a/tool1' },
    { fullName: 'tool2' },
    { fullName: 'a/c/tool3' },
    { fullName: 'b/tool4' }
  ]

  it('displays title and tools', () => {
    render(html`<${Explorer} toolsGroup=${groupByName(tools)} />`)

    expect(screen.getByText(translate('title.app'))).toBeInTheDocument()
    expect(screen.getByText('tool1')).toBeInTheDocument()
    expect(screen.getByText('tool2')).toBeInTheDocument()
    expect(screen.getByText('tool3')).toBeInTheDocument()
    expect(screen.getByText('tool4')).toBeInTheDocument()
    expect(screen.getByText('a')).toBeInTheDocument()
    expect(screen.getByText('b')).toBeInTheDocument()
    expect(screen.getByText('c')).toBeInTheDocument()
  })

  it('can expand and collapse nodes', async () => {
    render(html`<${Explorer} toolsGroup=${groupByName(tools)} />`)

    expect(screen.getByText('tool1').closest('.nested')).toHaveClass(
      'collapsed'
    )
    expect(screen.getByText('c').closest('.nested')).toHaveClass('collapsed')
    expect(screen.getByText('tool3').closest('.nested')).toHaveClass(
      'collapsed'
    )

    await fireEvent.click(screen.getByText('a'))
    expect(screen.getByText('tool1').closest('.nested')).not.toHaveClass(
      'collapsed'
    )
    expect(screen.getByText('c').closest('.nested')).not.toHaveClass(
      'collapsed'
    )
    expect(screen.getByText('tool3').closest('.nested')).toHaveClass(
      'collapsed'
    )

    await fireEvent.click(screen.getByText('c'))
    expect(screen.getByText('tool3').closest('.nested')).not.toHaveClass(
      'collapsed'
    )

    await fireEvent.click(screen.getByText('c'))
    expect(screen.getByText('tool3').closest('.nested')).toHaveClass(
      'collapsed'
    )
  })

  it('highlights and expand current tool', () => {
    render(
      html`<${Explorer} toolsGroup=${groupByName(tools)} current=${tools[3]} />`
    )

    expect(screen.getByText('tool1').closest('.nested')).toHaveClass(
      'collapsed'
    )
    expect(screen.getByText('tool4').closest('.nested')).not.toHaveClass(
      'collapsed'
    )
    expect(screen.getByText('tool4').closest('li')).toHaveClass('current')
  })

  it('can not collapse ancestor of current tool', async () => {
    render(
      html`<${Explorer} toolsGroup=${groupByName(tools)} current=${tools[2]} />`
    )

    expect(screen.getByText('tool3').closest('.nested')).not.toHaveClass(
      'collapsed'
    )
    expect(screen.getByText('c').closest('.nested')).not.toHaveClass(
      'collapsed'
    )

    await fireEvent.click(screen.getByText('a'))
    expect(screen.getByText('c').closest('.nested')).not.toHaveClass(
      'collapsed'
    )

    await fireEvent.click(screen.getByText('c'))
    expect(screen.getByText('tool3').closest('.nested')).not.toHaveClass(
      'collapsed'
    )
  })

  it('can select different toolsl', async () => {
    const handleSelect = jest.fn()
    render(
      html`<${Explorer}
        toolsGroup=${groupByName(tools)}
        current=${tools[3]}
        on:select=${handleSelect}
      />`
    )
    expect(handleSelect).not.toHaveBeenCalled()

    await fireEvent.click(screen.getByText('tool3'))
    expect(handleSelect).toHaveBeenCalledWith(
      expect.objectContaining({ detail: tools[2] })
    )
    expect(handleSelect).toHaveBeenCalledTimes(1)
  })
})
