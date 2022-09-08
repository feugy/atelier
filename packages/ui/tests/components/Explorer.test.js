import { fireEvent, render, screen, within } from '@testing-library/svelte'
import html from 'svelte-htm'
import { Explorer } from '../../src/components'
import { groupByName } from '../../src/utils'

describe('Explorer components', () => {
  const tools = [
    { fullName: 'a/tool1' },
    { fullName: 'tool2' },
    { fullName: 'a/c/tool3' },
    { fullName: 'b/tool4' },
    { fullName: 'b/tool5' }
  ]

  it('handles no data', () => {
    render(html`<${Explorer} />`)

    expect(screen.getByRole('navigation')).toHaveTextContent('')
    expect(screen.getAllByRole('list')[1]).toHaveTextContent('')
  })

  it('displays first level only', () => {
    render(html`<${Explorer} tools=${groupByName(tools)} />`)

    expect(screen.queryByText('tool1')).not.toBeInTheDocument()
    expect(screen.getByText('tool2')).toBeInTheDocument()
    expect(screen.queryByText('tool3')).not.toBeInTheDocument()
    expect(screen.queryByText('tool4')).not.toBeInTheDocument()
    expect(screen.queryByText('tool5')).not.toBeInTheDocument()
    expect(screen.getByText('a')).toBeInTheDocument()
    expect(screen.getByText('b')).toBeInTheDocument()
    expect(screen.queryByText('c')).not.toBeInTheDocument()
  })

  it('navigates to deeper level and shows breadcrumb', async () => {
    render(html`<${Explorer} tools=${groupByName(tools)} />`)

    const breadcrumb = screen.getByRole('navigation')
    const tree = screen.getAllByRole('list')[1]
    expect(within(breadcrumb).queryByText('home')).not.toBeInTheDocument()
    expect(within(breadcrumb).queryByText('a')).not.toBeInTheDocument()

    await fireEvent.click(within(tree).getByText('a'))
    expect(within(tree).getByText('tool1')).toBeInTheDocument()
    expect(within(tree).getByText('c')).toBeInTheDocument()

    expect(within(breadcrumb).getByText('home')).toBeInTheDocument()
    expect(within(breadcrumb).getByText('a')).toBeInTheDocument()
    expect(within(breadcrumb).queryByText('c')).not.toBeInTheDocument()
    expect(within(tree).queryByText('a')).not.toBeInTheDocument()

    await fireEvent.click(within(tree).getByText('c'))
    expect(within(tree).getByText('tool3')).toBeInTheDocument()

    expect(within(breadcrumb).getByText('home')).toBeInTheDocument()
    expect(within(breadcrumb).getByText('a')).toBeInTheDocument()
    expect(within(breadcrumb).getByText('c')).toBeInTheDocument()
    expect(within(tree).queryByText('c')).not.toBeInTheDocument()
  })

  it('navigates to parent', async () => {
    render(html`<${Explorer} tools=${groupByName(tools)} />`)

    const breadcrumb = screen.getByRole('navigation')
    const tree = screen.getAllByRole('list')[1]

    await fireEvent.click(within(tree).getByText('a'))
    await fireEvent.click(within(tree).getByText('c'))
    expect(within(tree).getByText('tool3')).toBeInTheDocument()
    expect(within(tree).queryByText('tool1')).not.toBeInTheDocument()
    expect(within(tree).queryByText('c')).not.toBeInTheDocument()
    expect(within(breadcrumb).getByText('home')).toBeInTheDocument()
    expect(within(breadcrumb).getByText('a')).toBeInTheDocument()
    expect(within(breadcrumb).getByText('c')).toBeInTheDocument()

    await fireEvent.click(within(breadcrumb).getByText('a'))
    expect(within(tree).getByText('tool1')).toBeInTheDocument()
    expect(within(tree).getByText('c')).toBeInTheDocument()
    expect(within(tree).queryByText('a')).not.toBeInTheDocument()
    expect(within(tree).queryByText('tool2')).not.toBeInTheDocument()
    expect(within(tree).queryByText('b')).not.toBeInTheDocument()
    expect(within(breadcrumb).queryByText('c')).not.toBeInTheDocument()

    await fireEvent.click(within(breadcrumb).getByText('home'))
    expect(screen.getByText('a')).toBeInTheDocument()
    expect(screen.getByText('tool2')).toBeInTheDocument()
    expect(screen.getByText('b')).toBeInTheDocument()
    expect(within(breadcrumb).queryByText('home')).not.toBeInTheDocument()
  })

  it('navigates to ancestor', async () => {
    render(html`<${Explorer} tools=${groupByName(tools)} />`)
    const breadcrumb = screen.getByRole('navigation')
    const tree = screen.getAllByRole('list')[1]

    await fireEvent.click(within(tree).getByText('a'))
    await fireEvent.click(within(tree).getByText('c'))
    expect(within(tree).getByText('tool3')).toBeInTheDocument()
    expect(within(tree).queryByText('tool1')).not.toBeInTheDocument()
    expect(within(tree).queryByText('c')).not.toBeInTheDocument()
    expect(within(breadcrumb).getByText('home')).toBeInTheDocument()
    expect(within(breadcrumb).getByText('a')).toBeInTheDocument()
    expect(within(breadcrumb).getByText('c')).toBeInTheDocument()

    await fireEvent.click(within(breadcrumb).getByText('home'))
    expect(screen.getByText('a')).toBeInTheDocument()
    expect(screen.getByText('tool2')).toBeInTheDocument()
    expect(screen.getByText('b')).toBeInTheDocument()
    expect(within(breadcrumb).queryByText('home')).not.toBeInTheDocument()
  })

  it('highlights current tool', () => {
    render(
      html`<${Explorer} tools=${groupByName(tools)} current=${tools[1]} />`
    )
    expect(screen.getByText('a')).not.toHaveClass('current')
    expect(screen.getByText('tool2')).toHaveClass('current')
    expect(screen.getByText('b')).not.toHaveClass('current')
  })

  it('highlights nested and navigates current tool', () => {
    render(
      html`<${Explorer} tools=${groupByName(tools)} current=${tools[2]} />`
    )

    const breadcrumb = screen.getByRole('navigation')
    const tree = screen.getAllByRole('list')[1]

    expect(within(tree).getByText('tool3')).toHaveClass('current')
    expect(within(tree).queryByText('tool1')).not.toBeInTheDocument()
    expect(within(tree).queryByText('c')).not.toBeInTheDocument()
    expect(within(breadcrumb).getByText('home')).toBeInTheDocument()
    expect(within(breadcrumb).getByText('a')).toBeInTheDocument()
    expect(within(breadcrumb).getByText('c')).toBeInTheDocument()
  })

  it('selects a different tool', async () => {
    const handleSelect = vi.fn()
    render(html`<${Explorer}
      tools=${groupByName(tools)}
      current=${tools[3]}
      on:select=${handleSelect}
    />`)

    const tree = screen.getAllByRole('list')[1]
    expect(within(tree).getByText('tool4')).toHaveClass('current')
    expect(within(tree).getByText('tool5')).not.toHaveClass('current')
    expect(handleSelect).not.toHaveBeenCalled()

    await fireEvent.click(within(tree).getByText('tool5'))
    expect(handleSelect).toHaveBeenCalledWith(
      expect.objectContaining({ detail: tools[4] })
    )
    expect(handleSelect).toHaveBeenCalledTimes(1)
    expect(within(tree).getByText('tool4')).not.toHaveClass('current')
    expect(within(tree).getByText('tool5')).toHaveClass('current')
  })

  it('can remove tools', async () => {
    const { component } = render(Explorer, {
      props: { current: tools[1], tools: groupByName(tools) }
    })

    expect(screen.getByText('a')).toBeInTheDocument()
    expect(screen.getByText('b')).toBeInTheDocument()

    await component.$set({ tools: groupByName(tools.slice(0, 3)) })
    expect(screen.getByText('a')).toBeInTheDocument()
    expect(screen.queryByText('b')).not.toBeInTheDocument()
  })

  it('resets current when removing current tool', async () => {
    const { component } = render(Explorer, {
      props: { current: tools[1], tools: groupByName(tools) }
    })
    expect(screen.getByText('a')).toBeInTheDocument()
    expect(screen.getByText('b')).toBeInTheDocument()
    expect(screen.getByText('tool2')).toHaveClass('current')

    await component.$set({ tools: groupByName([tools[0], ...tools.slice(2)]) })
    expect(screen.getByText('a')).toBeInTheDocument()
    expect(screen.getByText('b')).toBeInTheDocument()
    expect(screen.queryByText('tool2')).not.toBeInTheDocument()
  })

  it('jumps to first tool when removing current tool', async () => {
    const { component } = render(Explorer, {
      props: { current: tools[3], tools: groupByName(tools) }
    })
    expect(screen.getByText('tool4')).toHaveClass('current')
    expect(screen.getByText('tool5')).toBeInTheDocument()

    await component.$set({
      tools: groupByName([...tools.slice(0, 3), tools[4]]),
      current: tools[0]
    })
    expect(screen.getByText('tool1')).toHaveClass('current')
    expect(screen.getByText('c')).toBeInTheDocument()
    expect(screen.queryByText('tool4')).not.toBeInTheDocument()
    expect(screen.queryByText('tool5')).not.toBeInTheDocument()
  })

  it('display current when removing all displayed tools', async () => {
    const { component } = render(Explorer, {
      props: { current: tools[2], tools: groupByName(tools) }
    })
    await fireEvent.click(screen.getByText('home'))
    await fireEvent.click(screen.getByText('b'))
    expect(screen.getByText('tool4')).toBeInTheDocument()
    expect(screen.getByText('tool5')).toBeInTheDocument()

    await component.$set({
      tools: groupByName(tools.slice(0, 3))
    })
    expect(screen.getByText('tool3')).toHaveClass('current')
  })
})
