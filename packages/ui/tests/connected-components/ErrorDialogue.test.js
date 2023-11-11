import { render, screen, within } from '@testing-library/svelte'
import html from 'svelte-htm'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import ErrorDialogue from '../../src/connected-components/ErrorDialogue.svelte'
import { lastError } from '../../src/stores'
import { translate } from '../test-utils'

vi.mock('../../src/stores/tools', () => ({
  lastError: new (require('rxjs').BehaviorSubject)()
}))

describe('ErrorDialogue connected component', () => {
  beforeEach(() => {
    lastError.next()
  })

  it('displays nothing without error', () => {
    render(html`<${ErrorDialogue} />`)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('displays error message', () => {
    const message = 'some random error text'
    lastError.next(new Error(message))
    const { container } = render(html`<${ErrorDialogue} />`)
    const dialogue = screen.getByRole('dialog')
    expect(dialogue).toBeInTheDocument()
    expect(within(dialogue).getByRole('heading')).toHaveTextContent(
      translate('title.error')
    )
    expect(within(dialogue).getByRole('main')).toHaveTextContent(message)
    expect(within(dialogue).getByRole('contentinfo')).toHaveTextContent(
      translate('fix-and-reload')
    )
    expect(container).toMatchSnapshot()
  })
})
