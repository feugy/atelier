import { fireEvent, render, screen } from '@testing-library/svelte'
import { tick } from 'svelte'
import html from 'svelte-htm'
import { SizePicker } from '../../src/components'

describe('SizePicker component', () => {
  const viewport = {
    // we're not testing DOM elements, but assignments to mock object.
    /* eslint-disable jest-dom/prefer-to-have-style */
    style: {},
    parentElement: { classList: { add: vi.fn(), remove: vi.fn() } }
  }

  beforeEach(() => {
    viewport.style = {}
    vi.resetAllMocks()
  })

  describe.each([
    [
      'default sizes',
      true,
      [
        { icon: 'phone_android', height: 568, width: 320 },
        { icon: 'stay_current_landscape', height: 896, width: 414 },
        { icon: 'tablet_android', height: 1112, width: 834 }
      ]
    ],
    [
      'custom sizes',
      false,
      [
        { icon: 'laptop', height: 123, width: 654 },
        { icon: 'people', height: 800, width: 600 }
      ]
    ]
  ])('given %s', (_, useDefaults, sizes) => {
    it('displays buttons', async () => {
      render(
        html`<${SizePicker}
          sizes=${useDefaults ? undefined : sizes}
          viewport=${viewport}
        />`
      )

      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(sizes.length)
      for (const [i, { icon }] of sizes.entries()) {
        expect(buttons[i]).toHaveTextContent(icon)
      }
    })

    it('applies and removes size', async () => {
      render(
        html`<${SizePicker}
          sizes=${useDefaults ? undefined : sizes}
          viewport=${viewport}
        />`
      )

      const rank = 1
      fireEvent.click(screen.getAllByRole('button')[rank])
      await tick()
      expect(viewport.style.width).toEqual(`${sizes[rank].width}px`)
      expect(viewport.style.height).toEqual(`${sizes[rank].height}px`)
      expect(viewport.parentElement.classList.add).toHaveBeenCalledWith('frame')
      let buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(sizes.length + 2)
      expect(buttons[0]).toHaveTextContent('clear')
      expect(buttons[1]).toHaveTextContent('screen_rotation')
      for (const [i, { icon }] of sizes.entries()) {
        expect(buttons[i + 2]).toHaveTextContent(icon)
      }

      fireEvent.click(screen.getAllByRole('button')[0])
      await tick()
      buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(sizes.length)
      for (const [i, { icon }] of sizes.entries()) {
        expect(buttons[i]).toHaveTextContent(icon)
      }
      expect(viewport.style.width).toEqual('100%')
      expect(viewport.style.height).toEqual('100%')
      expect(viewport.parentElement.classList.remove).toHaveBeenCalledWith(
        'frame'
      )
    })

    it('rotates and maintain rotation', async () => {
      render(
        html`<${SizePicker}
          sizes=${useDefaults ? undefined : sizes}
          viewport=${viewport}
        />`
      )

      let rank = 0
      fireEvent.click(screen.getAllByRole('button')[rank])
      await tick()
      expect(viewport.style.width).toEqual(`${sizes[rank].width}px`)
      expect(viewport.style.height).toEqual(`${sizes[rank].height}px`)
      expect(viewport.parentElement.classList.add).toHaveBeenNthCalledWith(
        1,
        'frame'
      )

      fireEvent.click(screen.getAllByRole('button')[1])
      await tick()
      expect(viewport.style.width).toEqual(`${sizes[rank].height}px`)
      expect(viewport.style.height).toEqual(`${sizes[rank].width}px`)

      rank = 1
      fireEvent.click(screen.getAllByRole('button')[rank + 2])
      await tick()
      expect(viewport.style.width).toEqual(`${sizes[rank].height}px`)
      expect(viewport.style.height).toEqual(`${sizes[rank].width}px`)
      expect(viewport.parentElement.classList.add).toHaveBeenNthCalledWith(
        2,
        'frame'
      )
    })
  })
})
