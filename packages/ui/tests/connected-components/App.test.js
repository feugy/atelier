import { render, screen } from '@testing-library/svelte'
import html from 'svelte-htm'
import { translate } from '../test-utils'
import { App } from '../../src/connected-components'

describe('App connected component', () => {
  it('displays explorer, pane container and loader', () => {
    const { container } = render(html`<${App} />`)
    expect(screen.queryByRole('heading')).toHaveTextContent(
      translate('title.app')
    )
    const navs = screen.queryAllByRole('navigation')
    // container + pane containers
    expect(navs).toHaveLength(2)
    expect(container).toMatchSnapshot()
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })
})
