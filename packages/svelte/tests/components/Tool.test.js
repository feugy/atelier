import { fireEvent, render, screen } from '@testing-library/svelte'
import html from 'svelte-htm'
import faker from 'faker'
import TestButton from './TestButton.svelte'
import { Tool, ToolBox } from '../../src'
import { currentTool, registerTool, recordEvent } from '../../src/stores'

jest.mock('../../src/stores', () => {
  const { writable } = require('svelte/store')
  return {
    currentTool: new writable(),
    registerTool: jest.fn(),
    recordEvent: jest.fn()
  }
})

describe('Tool component', () => {
  beforeEach(jest.resetAllMocks)

  describe('given no toolbox', () => {
    it('needs a name', () => {
      expect(() => render(html`<${Tool} />`)).toThrow(
        'Tool needs a name property'
      )
    })

    it('registers tool and renders component when being current', () => {
      const name = faker.lorem.words()
      currentTool.set({ name })
      render(html`<${Tool} name=${name} component=${TestButton} />`)

      expect(screen.queryByRole('button')).toBeInTheDocument()
      expect(registerTool).toHaveBeenCalledWith({ name, props: {} })
      expect(registerTool).toHaveBeenCalledTimes(1)
      expect(recordEvent).not.toHaveBeenCalled()
    })

    it('registers tools and renders nothing', () => {
      const name = faker.lorem.words()
      render(html`<${Tool} name=${name} component=${TestButton} />`)

      expect(screen.queryByRole('button')).not.toBeInTheDocument()
      expect(registerTool).toHaveBeenCalledWith({ name, props: {} })
      expect(registerTool).toHaveBeenCalledTimes(1)
      expect(recordEvent).not.toHaveBeenCalled()
    })

    it('does not register multiple times', () => {
      const name = faker.lorem.words()
      const { component } = render(
        html`<${Tool} name=${name} component=${TestButton} />`
      )
      expect(registerTool).toHaveBeenCalledWith({ name, props: {} })
      expect(registerTool).toHaveBeenCalledTimes(1)

      component.$set({ name: faker.lorem.words() })
      expect(registerTool).toHaveBeenCalledTimes(1)
      expect(recordEvent).not.toHaveBeenCalled()
    })

    it('passes props down to the component', () => {
      const name = faker.lorem.words()
      currentTool.set({ name })
      const props = {
        label: faker.commerce.productName(),
        disabled: true
      }
      render(
        html`<${Tool} name=${name} component=${TestButton} props=${props} />`
      )
      expect(registerTool).toHaveBeenCalledWith({ name, props })
      expect(registerTool).toHaveBeenCalledTimes(1)

      const button = screen.queryByRole('button')
      expect(button).toBeInTheDocument()
      expect(button).toHaveTextContent(props.label)
      expect(button).toBeDisabled()
    })

    it('listens to desired events', async () => {
      const name = faker.lorem.words()
      currentTool.set({ name })
      render(
        html`<${Tool}
          name=${name}
          component=${TestButton}
          events=${['enter', 'click']}
        />`
      )

      const button = screen.queryByRole('button')
      expect(button).toBeInTheDocument()
      expect(recordEvent).not.toHaveBeenCalled()

      await fireEvent.click(button)
      expect(recordEvent).toHaveBeenCalledWith('click', expect.any(MouseEvent))

      await fireEvent.mouseEnter(button)
      expect(recordEvent).toHaveBeenCalledWith('enter', expect.any(CustomEvent))
      expect(recordEvent).toHaveBeenCalledTimes(2)
    })
  })

  describe('given a toolbox', () => {
    it('needs a name', () => {
      const name = faker.lorem.words()
      expect(() =>
        render(html`<${ToolBox} name=${name}><${Tool} /></${ToolBox}>`)
      ).toThrow('Tool needs a name property')
    })

    it('registers tool and renders component when being current', () => {
      const name = faker.lorem.words()
      const toolBoxName = faker.lorem.words()
      currentTool.set({ name: `${toolBoxName}/${name}` })
      render(
        html`<${ToolBox} name=${toolBoxName} component=${TestButton}
          ><${Tool} name=${name}
        /></${ToolBox}>`
      )

      expect(screen.queryByRole('button')).toBeInTheDocument()
      expect(registerTool).toHaveBeenCalledWith({
        name: `${toolBoxName}/${name}`,
        props: {}
      })
      expect(registerTool).toHaveBeenCalledTimes(1)
      expect(recordEvent).not.toHaveBeenCalled()
    })

    it('registers tool and renders nothing', () => {
      const name1 = faker.lorem.words()
      const name2 = faker.lorem.words()
      const toolBoxName = faker.lorem.words()
      render(
        html`<${ToolBox} name=${toolBoxName} component=${TestButton}
          ><${Tool} name=${name1} /><${Tool} name=${name2}
        /></${ToolBox}>`
      )

      expect(screen.queryByRole('button')).not.toBeInTheDocument()
      expect(registerTool).toHaveBeenCalledWith({
        name: `${toolBoxName}/${name1}`,
        props: {}
      })
      expect(registerTool).toHaveBeenCalledWith({
        name: `${toolBoxName}/${name2}`,
        props: {}
      })
      expect(registerTool).toHaveBeenCalledTimes(2)
      expect(recordEvent).not.toHaveBeenCalled()
    })

    it('does not register multiple times', () => {
      const name1 = faker.lorem.words()
      const name2 = faker.lorem.words()
      const toolBoxName = faker.lorem.words()
      const { component } = render(
        html`<${ToolBox} name=${toolBoxName} component=${TestButton}
          ><${Tool} name=${name1} /><${Tool} name=${name2}
        /></${ToolBox}>`
      )
      expect(registerTool).toHaveBeenCalledWith({
        name: `${toolBoxName}/${name1}`,
        props: {}
      })
      expect(registerTool).toHaveBeenCalledWith({
        name: `${toolBoxName}/${name2}`,
        props: {}
      })

      component.$set({ name: faker.lorem.words() })
      expect(registerTool).toHaveBeenCalledTimes(2)
      expect(recordEvent).not.toHaveBeenCalled()
    })

    it('passes toolbox props and tool props down to the component', () => {
      const toolBox = {
        name: faker.lorem.words(),
        props: { disabled: true, label: faker.commerce.productName() }
      }
      const tool = {
        name: faker.lorem.words(),
        props: { label: faker.commerce.productName() }
      }
      currentTool.set({ name: `${toolBox.name}/${tool.name}` })
      render(
        html`<${ToolBox}
          name=${toolBox.name}
          component=${TestButton}
          props=${toolBox.props}
          ><${Tool} name=${tool.name} props=${tool.props}
        /></${ToolBox}>`
      )
      expect(registerTool).toHaveBeenCalledWith({
        name: `${toolBox.name}/${tool.name}`,
        props: { ...toolBox.props, ...tool.props }
      })

      const button = screen.queryByRole('button')
      expect(button).toBeInTheDocument()
      expect(button).toHaveTextContent(tool.props.label)
      expect(button).toBeDisabled()
    })

    it('listens to toolbox and tool desired events', async () => {
      const toolBox = {
        name: faker.lorem.words(),
        events: ['enter']
      }
      const tool = {
        name: faker.lorem.words(),
        events: ['click']
      }
      currentTool.set({ name: `${toolBox.name}/${tool.name}` })
      render(
        html`<${ToolBox}
          name=${toolBox.name}
          component=${TestButton}
          events=${toolBox.events}
          ><${Tool} name=${tool.name} events=${tool.events}
        /></${ToolBox}>`
      )

      const button = screen.queryByRole('button')
      expect(button).toBeInTheDocument()
      expect(recordEvent).not.toHaveBeenCalled()

      await fireEvent.click(button)
      expect(recordEvent).toHaveBeenCalledWith('click', expect.any(MouseEvent))

      await fireEvent.mouseEnter(button)
      expect(recordEvent).toHaveBeenCalledWith('enter', expect.any(CustomEvent))
      expect(recordEvent).toHaveBeenCalledTimes(2)
    })

    it('does not allow component override', () => {
      const toolBoxName = faker.lorem.words()
      const name = faker.lorem.words()

      expect(() =>
        render(
          html`<${ToolBox}
            name=${toolBoxName}
            component=${TestButton}
            ><${Tool} name=${name} component=${TestButton}
          /></${ToolBox}>`
        )
      ).toThrow(
        `Tool "${name}" does not support component property since its ToolBox "${toolBoxName}" already have one`
      )
    })
  })
})
