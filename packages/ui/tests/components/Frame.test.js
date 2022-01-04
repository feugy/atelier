import { render, screen, waitFor } from '@testing-library/svelte'
import html from 'svelte-htm'
import { get, writable } from 'svelte/store'
import { Frame } from '../../src/components'

describe('Frame components', () => {
  it('displays loader', () => {
    render(html`<${Frame} />`)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it.each([
    ['when aborting', new Event('abort', {})],
    ['on error', new Event('error', {})],
    ['on success', new Event('load', {})]
  ])('hides loader %s', async (_, event) => {
    const $frame = writable()
    render(html`<${Frame} bind:frame=${$frame} />`)

    get($frame).dispatchEvent(event)
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    })
  })

  it('exposes viewport with a parent', () => {
    const $viewport = writable()
    render(html`<${Frame} bind:viewport=${$viewport} />`)

    const viewport = get($viewport)
    expect(viewport).toBeInstanceOf(Element)
    expect(viewport.tagName).toBe('DIV')
    expect(viewport.parentElement).toBeDefined()
  })
})
