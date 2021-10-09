import { fireEvent, render, screen } from '@testing-library/svelte'
import html from 'svelte-htm'
import { Toolbar } from '../../src/components'
import { translate } from '../test-utils'

describe('Toolbar component', () => {
  it('cycle through backgrounds', async () => {
    const viewport = {
      style: {},
      parentElement: { classList: { add: jest.fn(), remove: jest.fn() } }
    }
    render(html`<${Toolbar} viewport=${viewport} />`)
    expect(viewport.style.backgroundColor).toBeUndefined()

    const backgroundButton = screen.queryByRole('button', {
      name: translate('tooltip.background')
    })
    await fireEvent.click(backgroundButton)
    expect(viewport.style.backgroundColor).toEqual('white')
    expect(viewport.style.backgroundImage).toEqual('none')

    await fireEvent.click(backgroundButton)
    expect(viewport.style.backgroundColor).toEqual('black')
    expect(viewport.style.backgroundImage).toEqual('none')

    await fireEvent.click(backgroundButton)
    expect(viewport.style.backgroundColor).toEqual('')
    expect(viewport.style.backgroundImage).toEqual('')
  })

  it('toggle viewport mode', async () => {
    const viewport = {
      style: {},
      parentElement: { classList: { add: jest.fn(), remove: jest.fn() } }
    }
    render(html`<${Toolbar} viewport=${viewport} />`)
    expect(viewport.style.backgroundColor).toBeUndefined()

    const viewPortButton = screen.queryByRole('button', {
      name: translate('tooltip.viewport')
    })
    await fireEvent.click(viewPortButton)
    expect(viewport.style.width).toEqual('1112px')
    expect(viewport.style.height).toEqual('832px')
    expect(viewport.parentElement.classList.add).toHaveBeenCalledWith('frame')

    await fireEvent.click(viewPortButton)
    expect(viewport.style.width).toEqual('100%')
    expect(viewport.style.height).toEqual('100%')
    expect(viewport.parentElement.classList.remove).toHaveBeenCalledWith(
      'frame'
    )

    expect(viewport.parentElement.classList.add).toHaveBeenCalledTimes(1)
    expect(viewport.parentElement.classList.remove).toHaveBeenCalledTimes(1)
  })

  it('can set custom viewport dimension', async () => {
    const viewport = {
      style: {},
      parentElement: { classList: { add: jest.fn(), remove: jest.fn() } }
    }
    render(html`<${Toolbar} viewport=${viewport} />`)
    expect(viewport.style.backgroundColor).toBeUndefined()

    const viewPortButton = screen.queryByRole('button', {
      name: translate('tooltip.viewport')
    })
    await fireEvent.click(viewPortButton)
    expect(viewport.style.width).toEqual('1112px')
    expect(viewport.style.height).toEqual('832px')
    expect(viewport.parentElement.classList.add).toHaveBeenCalledWith('frame')
    const [widthTextbox, heightTextbox] = screen.queryAllByRole('textbox')

    await fireEvent.input(widthTextbox, { target: { value: '500' } })
    expect(viewport.style.width).toEqual('500px')
    expect(viewport.style.height).toEqual('832px')

    await fireEvent.input(heightTextbox, { target: { value: '300' } })
    expect(viewport.style.width).toEqual('500px')
    expect(viewport.style.height).toEqual('300px')

    expect(viewport.parentElement.classList.add).toHaveBeenCalledTimes(1)
    expect(viewport.parentElement.classList.remove).not.toHaveBeenCalled()
  })

  it('can invert viewport dimensions', async () => {
    const viewport = {
      style: {},
      parentElement: { classList: { add: jest.fn(), remove: jest.fn() } }
    }
    render(html`<${Toolbar} viewport=${viewport} />`)
    expect(viewport.style.backgroundColor).toBeUndefined()

    const viewPortButton = screen.queryByRole('button', {
      name: translate('tooltip.viewport')
    })
    await fireEvent.click(viewPortButton)
    expect(viewport.style.width).toEqual('1112px')
    expect(viewport.style.height).toEqual('832px')
    expect(viewport.parentElement.classList.add).toHaveBeenCalledWith('frame')

    const invertButton = screen.queryByRole('button', { name: 'swap_horiz' })
    await fireEvent.click(invertButton)
    expect(viewport.style.height).toEqual('1112px')
    expect(viewport.style.width).toEqual('832px')

    await fireEvent.click(invertButton)
    expect(viewport.style.width).toEqual('1112px')
    expect(viewport.style.height).toEqual('832px')
  })
})
