import { fireEvent, render, screen } from '@testing-library/svelte'
import html from 'svelte-htm'
import { BackgroundPicker } from '../../src/components'

describe('BackgroundPicker component', () => {
  const viewport = { style: {} }

  beforeEach(() => {
    viewport.style = {}
  })

  describe.each([
    ['default backgrounds', true, ['', 'white', '#e0e0e0', '#a0a0a0', 'black']],
    [
      'custom backgrounds',
      false,
      [
        '#e879f9',
        '',
        'rgba(150, 75, 50, 0.5)',
        'linear-gradient(to right, red, orange)'
      ]
    ]
  ])('given %s', (_, useDefaults, backgrounds) => {
    it('displays backgrounds', async () => {
      render(
        html`<${BackgroundPicker}
          backgrounds=${useDefaults ? undefined : backgrounds}
          viewport=${viewport}
        />`
      )

      const items = screen.getAllByRole('button')
      expect(items).toHaveLength(backgrounds.length)
      for (const [i, background] of backgrounds.entries()) {
        if (background) {
          // we're not testing DOM elements, but svelte bindings.
          expect(items[i].style.cssText).toEqual(`--background: ${background};`) // eslint-disable-line jest-dom/prefer-to-have-style
        }
      }
    })

    it('applies background', async () => {
      render(
        html`<${BackgroundPicker}
          backgrounds=${useDefaults ? undefined : backgrounds}
          viewport=${viewport}
        />`
      )

      const items = screen.getAllByRole('button')
      fireEvent.click(items[1])
      expect(viewport.style.background).toEqual(backgrounds[1])

      fireEvent.click(items[3])
      expect(viewport.style.background).toEqual(backgrounds[3])
    })

    it('applies first background by default', async () => {
      render(
        html`<${BackgroundPicker}
          backgrounds=${useDefaults ? undefined : backgrounds}
          viewport=${viewport}
        />`
      )

      expect(viewport.style.background).toEqual(backgrounds[0])
    })
  })
})
