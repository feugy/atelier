import { render, screen, waitFor, within } from '@testing-library/svelte'
import html from 'svelte-htm'
import { translate } from '../test-utils'
import { App } from '../../src/connected-components'
import { reloadSettings } from '../../src/stores'

describe('App connected component', () => {
  beforeEach(vi.resetAllMocks)

  it('displays explorer, pane container with default pickers and loader', () => {
    const { container } = render(html`<${App} />`)
    expect(screen.queryByRole('heading')).toHaveTextContent(
      translate('title.app')
    )
    const navs = screen.queryAllByRole('navigation')
    // container + pane containers
    expect(navs).toHaveLength(2)
    expect(container).toMatchSnapshot()
    expect(screen.getByRole('progressbar')).toBeInTheDocument()

    const toolBars = screen.getAllByRole('toolbar')
    // sizes and backgrounds
    expect(toolBars).toHaveLength(2)
    // 3 default sizes
    expect(within(toolBars[0]).getAllByRole('button')).toHaveLength(3)
    // 5 default backgrounds
    expect(within(toolBars[1]).getAllByRole('button')).toHaveLength(5)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('passes settings to size and background pickers', () => {
    const sizes = [
      {
        icon: 'tablet_android',
        height: 720,
        width: 1280
      },
      {
        icon: 'laptop',
        height: 1080,
        width: 1920
      }
    ]
    const backgrounds = ['', 'pink', 'yellow']
    window.uiSettings = { sizes, backgrounds }
    reloadSettings()

    render(html`<${App} />`)
    const toolBars = screen.getAllByRole('toolbar')
    // sizes and backgrounds
    expect(toolBars).toHaveLength(2)
    expect(within(toolBars[0]).getAllByRole('button')).toHaveLength(
      sizes.length
    )
    expect(within(toolBars[1]).getAllByRole('button')).toHaveLength(
      backgrounds.length
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('validates size settings', async () => {
    window.uiSettings = { sizes: [{ invalid: true }] }
    reloadSettings()
    render(html`<${App} />`)

    let dialog
    await waitFor(() => {
      dialog = screen.queryByRole('dialog')
      expect(dialog).toBeInTheDocument()
    })
    expect(within(dialog).getByRole('main')).toHaveTextContent(
      `Invalid value for "sizes" UI settings: data/0 must have required property 'icon'`
    )
  })

  it('validates backgrounds settings', async () => {
    window.uiSettings = { backgrounds: ['', 18] }
    reloadSettings()
    render(html`<${App} />`)

    let dialog
    await waitFor(() => {
      dialog = screen.queryByRole('dialog')
      expect(dialog).toBeInTheDocument()
    })
    expect(within(dialog).getByRole('main')).toHaveTextContent(
      `Invalid value for "backgrounds" UI settings: data/1 must be string`
    )
  })
})
