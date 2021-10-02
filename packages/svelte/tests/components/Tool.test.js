import { fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import { get, writable } from 'svelte/store'
import html from 'svelte-htm'
import faker from 'faker'
import { Button } from '../test-components'
import { Tool, ToolBox } from '../../src'
import {
  currentTool,
  registerTool,
  recordEvent,
  recordVisibility
} from '../../src/stores'
import { tick } from 'svelte'

jest.mock('../../src/stores', () => {
  const { writable } = require('svelte/store')
  return {
    currentTool: new writable(),
    registerTool: jest.fn(),
    recordEvent: jest.fn(),
    recordVisibility: jest.fn()
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

    it('registers tool and renders component when being current', async () => {
      const name = faker.lorem.words()
      currentTool.set({ fullName: name, name })
      render(html`<${Tool} name=${name} component=${Button} />`)
      await waitFor(() =>
        expect(recordVisibility).toHaveBeenCalledWith({
          name,
          fullName: name,
          visible: true
        })
      )

      expect(screen.queryByRole('button')).toBeInTheDocument()
      expect(registerTool).toHaveBeenCalledWith({
        name,
        fullName: name,
        props: {},
        events: [],
        updateProperty: expect.any(Function)
      })
      expect(registerTool).toHaveBeenCalledTimes(1)
      expect(recordEvent).not.toHaveBeenCalled()
    })

    it('registers tools and renders nothing', async () => {
      const name = faker.lorem.words()
      render(html`<${Tool} name=${name} component=${Button} />`)
      expect(registerTool).toHaveBeenCalledWith({
        name,
        fullName: name,
        props: {},
        events: [],
        updateProperty: expect.any(Function)
      })
      await tick()
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
      expect(recordVisibility).not.toHaveBeenCalled()
      expect(registerTool).toHaveBeenCalledTimes(1)
      expect(recordEvent).not.toHaveBeenCalled()
    })

    it('does not register multiple times', async () => {
      const name = faker.lorem.words()
      const { component } = render(
        html`<${Tool} name=${name} component=${Button} />`
      )
      expect(registerTool).toHaveBeenCalledWith({
        name,
        fullName: name,
        props: {},
        events: [],
        updateProperty: expect.any(Function)
      })
      expect(registerTool).toHaveBeenCalledTimes(1)

      component.$set({ name: faker.lorem.words() })
      await tick()
      expect(recordVisibility).not.toHaveBeenCalled()
      expect(registerTool).toHaveBeenCalledTimes(1)
      expect(recordEvent).not.toHaveBeenCalled()
    })

    it('passes props down to the component', async () => {
      const name = faker.lorem.words()
      currentTool.set({ fullName: name, name })
      const props = {
        label: faker.commerce.productName(),
        disabled: true
      }
      render(html`<${Tool} name=${name} component=${Button} props=${props} />`)
      expect(registerTool).toHaveBeenCalledWith({
        name,
        fullName: name,
        props,
        events: [],
        updateProperty: expect.any(Function)
      })
      expect(registerTool).toHaveBeenCalledTimes(1)

      await waitFor(() =>
        expect(recordVisibility).toHaveBeenCalledWith({
          name,
          fullName: name,
          visible: true
        })
      )
      expect(screen.queryByRole('button')).toBeInTheDocument()
      const button = screen.queryByRole('button')
      expect(button).toHaveTextContent(props.label)
      expect(button).toBeDisabled()
    })

    it('passes props down to the slotted component', async () => {
      const name = faker.lorem.words()
      currentTool.set({ fullName: name, name })
      const props = {
        label: faker.commerce.productName(),
        disabled: true
      }
      render(
        html`<${Tool} name=${name} props=${props}>
          <${Button} ...${props} />
        </${Tool}>`
      )
      expect(registerTool).toHaveBeenCalledWith({
        name,
        fullName: name,
        props,
        events: [],
        updateProperty: expect.any(Function)
      })
      expect(registerTool).toHaveBeenCalledTimes(1)

      await waitFor(() =>
        expect(recordVisibility).toHaveBeenCalledWith({
          name,
          fullName: name,
          visible: true
        })
      )
      expect(screen.queryByRole('button')).toBeInTheDocument()
      const button = screen.queryByRole('button')
      expect(button).toBeInTheDocument()
      expect(button).toHaveTextContent(props.label)
      expect(button).toBeDisabled()
    })

    it('updates component props when invoking updateProperty()', async () => {
      const name = faker.lorem.words()
      currentTool.set({ fullName: name, name })
      render(html`<${Tool} name=${name} component=${Button} />`)
      expect(registerTool).toHaveBeenCalledWith({
        name,
        fullName: name,
        props: {},
        events: [],
        updateProperty: expect.any(Function)
      })

      await waitFor(() =>
        expect(recordVisibility).toHaveBeenCalledWith({
          name,
          fullName: name,
          visible: true
        })
      )
      expect(screen.queryByRole('button')).toBeInTheDocument()
      const button = screen.queryByRole('button')
      expect(button).toBeInTheDocument()
      expect(button).toHaveTextContent('Hey oh!')

      const value = faker.commerce.productName()
      registerTool.mock.calls[0][0].updateProperty('label', value)

      await tick()
      expect(screen.queryByRole('button')).toHaveTextContent(value)
      expect(registerTool).toHaveBeenCalledTimes(1)
    })

    it('updates slot props when invoking updateProperty()', async () => {
      const name = faker.lorem.words()
      currentTool.set({ fullName: name, name })
      const props = writable()
      render(
        html`<${Tool} name=${name} let:props=${props}>
          <${Button} />
        </${Tool}>`
      )
      expect(registerTool).toHaveBeenCalledWith({
        name,
        fullName: name,
        props: {},
        events: [],
        updateProperty: expect.any(Function)
      })
      await waitFor(() =>
        expect(recordVisibility).toHaveBeenCalledWith({
          name,
          fullName: name,
          visible: true
        })
      )
      expect(screen.queryByRole('button')).toBeInTheDocument()
      expect(get(props)).toEqual({})
      const button = screen.queryByRole('button')
      expect(button).toBeInTheDocument()
      expect(button).toHaveTextContent('Hey oh!')

      const value = faker.commerce.productName()
      registerTool.mock.calls[0][0].updateProperty('label', value)

      expect(get(props)).toEqual({
        label: value
      })
    })

    it('listens to desired events', async () => {
      const name = faker.lorem.words()
      currentTool.set({ fullName: name, name })
      const events = ['enter', 'click']
      render(
        html`<${Tool} name=${name} component=${Button} events=${events} />`
      )
      expect(registerTool).toHaveBeenCalledWith({
        name,
        fullName: name,
        props: {},
        events,
        updateProperty: expect.any(Function)
      })
      await waitFor(() =>
        expect(recordVisibility).toHaveBeenCalledWith({
          name,
          fullName: name,
          visible: true
        })
      )
      expect(screen.queryByRole('button')).toBeInTheDocument()

      const button = screen.queryByRole('button')
      expect(button).toBeInTheDocument()
      expect(recordEvent).not.toHaveBeenCalled()

      await fireEvent.click(button)
      expect(recordEvent).toHaveBeenCalledWith('click', expect.any(MouseEvent))

      await fireEvent.mouseEnter(button)
      expect(recordEvent).toHaveBeenCalledWith('enter', expect.any(CustomEvent))
      expect(recordEvent).toHaveBeenCalledTimes(2)
    })

    it('passes event handles to slot', async () => {
      const name = faker.lorem.words()
      currentTool.set({ fullName: name, name })
      const events = ['enter', 'click']
      const handleEvent = new writable()
      render(
        html`<${Tool}
          name=${name}
          events=${events}
          let:handleEvent=${handleEvent}
        >
          <${Button} />
        </${Tool}>`
      )
      expect(registerTool).toHaveBeenCalledWith({
        name,
        fullName: name,
        props: {},
        events,
        updateProperty: expect.any(Function)
      })
      expect(recordEvent).not.toHaveBeenCalled()
      await waitFor(() =>
        expect(recordVisibility).toHaveBeenCalledWith({
          name,
          fullName: name,
          visible: true
        })
      )
      expect(screen.queryByRole('button')).toBeInTheDocument()

      get(handleEvent)(new MouseEvent('click'))
      expect(recordEvent).toHaveBeenCalledWith('click', expect.any(MouseEvent))
      expect(recordEvent).toHaveBeenCalledTimes(1)
    })

    it('supports slot extra content', async () => {
      const header = faker.lorem.words()
      const footer = faker.lorem.words()
      const name = faker.lorem.word()
      const props = new writable()
      currentTool.set({ fullName: name, name })
      render(
        html`<${Tool} name=${name} let:props=${props}>
          <p>${header}</p>
          <${Button} ${props} />
          <p>${footer}</p>
        </${Tool}>`
      )
      await waitFor(() =>
        expect(recordVisibility).toHaveBeenCalledWith({
          name,
          fullName: name,
          visible: true
        })
      )
      expect(screen.queryByText(header)).toBeInTheDocument()
      expect(screen.queryByRole('button')).toBeInTheDocument()
      expect(screen.queryByText(footer)).toBeInTheDocument()
    })

    it('calls tool setup before displaying it', async () => {
      const name = faker.lorem.words()
      const setup = jest.fn().mockResolvedValue()
      const props = { label: 'Aww yeah' }
      render(
        html`<${Tool}
          name=${name}
          component=${Button}
          props=${props}
          setup=${setup}
        />`
      )
      await tick()

      expect(screen.queryByRole('button')).not.toBeInTheDocument()
      expect(setup).not.toHaveBeenCalled()

      currentTool.set({ fullName: name, name })
      await tick()
      await tick()
      expect(setup).toHaveBeenCalledWith({ name, fullName: name, props })
      expect(setup).toHaveBeenCalledTimes(1)
      await waitFor(() =>
        expect(recordVisibility).toHaveBeenCalledWith({
          name,
          fullName: name,
          visible: true
        })
      )
      expect(screen.queryByRole('button')).toBeInTheDocument()
    })

    it('calls tool setup before displaying within a slot', async () => {
      const name = faker.lorem.words()
      const setup = jest.fn().mockResolvedValue()
      const props = { label: 'Aww yeah' }
      render(
        html`<${Tool} name=${name} props=${props} setup=${setup}><${Button} /></${Tool}>`
      )
      await tick()
      await tick()

      expect(screen.queryByRole('button')).not.toBeInTheDocument()
      expect(setup).not.toHaveBeenCalled()

      currentTool.set({ fullName: name, name })
      await tick()
      await tick()
      expect(setup).toHaveBeenCalledWith({ name, fullName: name, props })
      expect(setup).toHaveBeenCalledTimes(1)
      await waitFor(() =>
        expect(recordVisibility).toHaveBeenCalledWith({
          name,
          fullName: name,
          visible: true
        })
      )
      expect(screen.queryByRole('button')).toBeInTheDocument()
    })

    it('calls tool teardown after destroying it', async () => {
      const name = faker.lorem.words()
      const teardown = jest.fn().mockResolvedValue()
      render(
        html`<${Tool} name=${name} component=${Button} teardown=${teardown} />`
      )
      await tick()

      expect(screen.queryByRole('button')).not.toBeInTheDocument()
      expect(teardown).not.toHaveBeenCalled()

      currentTool.set({ fullName: name, name })
      await waitFor(() =>
        expect(recordVisibility).toHaveBeenNthCalledWith(1, {
          name,
          fullName: name,
          visible: true
        })
      )
      expect(screen.queryByRole('button')).toBeInTheDocument()
      expect(teardown).not.toHaveBeenCalled()

      currentTool.set({ fullName: 'whatever', name: 'whatever' })
      await waitFor(() =>
        expect(recordVisibility).toHaveBeenNthCalledWith(2, {
          name,
          fullName: name,
          visible: false
        })
      )
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
      expect(teardown).toHaveBeenCalledTimes(1)
      expect(recordVisibility).toHaveBeenCalledTimes(2)
    })

    it('calls tool teardown after destroying it within a slot', async () => {
      const name = faker.lorem.words()
      const teardown = jest.fn().mockResolvedValue()
      render(
        html`<${Tool} name=${name} teardown=${teardown}><${Button} /></${Tool}>`
      )
      await tick()

      expect(screen.queryByRole('button')).not.toBeInTheDocument()
      expect(teardown).not.toHaveBeenCalled()

      currentTool.set({ fullName: name, name })
      await waitFor(() =>
        expect(recordVisibility).toHaveBeenNthCalledWith(1, {
          name,
          fullName: name,
          visible: true
        })
      )
      expect(screen.queryByRole('button')).toBeInTheDocument()
      expect(teardown).not.toHaveBeenCalled()

      currentTool.set({ fullName: 'whatever', name: 'whatever' })
      await waitFor(() =>
        expect(recordVisibility).toHaveBeenNthCalledWith(2, {
          name,
          fullName: name,
          visible: false
        })
      )
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
      expect(teardown).toHaveBeenCalledTimes(1)
      expect(recordVisibility).toHaveBeenCalledTimes(2)
    })
  })

  describe('given a toolbox', () => {
    it('needs a name', () => {
      const name = faker.lorem.words()
      expect(() =>
        render(html`<${ToolBox} name=${name}><${Tool} /></`)
      ).toThrow('Tool needs a name property')
    })

    it('registers tool and renders component when being current', async () => {
      const name = faker.lorem.words()
      const toolBoxName = faker.lorem.words()
      currentTool.set({ name, fullName: `${toolBoxName}/${name}` })
      render(
        html`<${ToolBox} name=${toolBoxName} component=${Button}>
          <${Tool} name=${name} />
        </${ToolBox}>`
      )
      await waitFor(() =>
        expect(recordVisibility).toHaveBeenCalledWith({
          name,
          fullName: `${toolBoxName}/${name}`,
          visible: true
        })
      )
      expect(screen.queryByRole('button')).toBeInTheDocument()
      expect(registerTool).toHaveBeenCalledWith({
        name,
        fullName: `${toolBoxName}/${name}`,
        props: {},
        events: [],
        updateProperty: expect.any(Function)
      })
      expect(registerTool).toHaveBeenCalledTimes(1)
      expect(recordEvent).not.toHaveBeenCalled()
    })

    it('registers tool and renders nothing', async () => {
      const name1 = faker.lorem.words()
      const name2 = faker.lorem.words()
      const toolBoxName = faker.lorem.words()
      render(
        html`<${ToolBox} name=${toolBoxName} component=${Button}>
          <${Tool} name=${name1} />
          <${Tool} name=${name2} />
        </${ToolBox}>`
      )
      expect(registerTool).toHaveBeenCalledWith({
        name: name1,
        fullName: `${toolBoxName}/${name1}`,
        props: {},
        events: [],
        updateProperty: expect.any(Function)
      })
      expect(registerTool).toHaveBeenCalledWith({
        name: name2,
        fullName: `${toolBoxName}/${name2}`,
        props: {},
        events: [],
        updateProperty: expect.any(Function)
      })
      await tick()
      expect(registerTool).toHaveBeenCalledTimes(2)
      expect(recordEvent).not.toHaveBeenCalled()
      expect(recordVisibility).not.toHaveBeenCalled()
    })

    it('does not register multiple times', async () => {
      const name1 = faker.lorem.words()
      const name2 = faker.lorem.words()
      const toolBoxName = faker.lorem.words()
      const { component } = render(
        html`<${ToolBox} name=${toolBoxName} component=${Button}>
          <${Tool} name=${name1} />
          <${Tool} name=${name2} />
        </${ToolBox}>`
      )
      expect(registerTool).toHaveBeenCalledWith({
        name: name1,
        fullName: `${toolBoxName}/${name1}`,
        props: {},
        events: [],
        updateProperty: expect.any(Function)
      })
      expect(registerTool).toHaveBeenCalledWith({
        name: name2,
        fullName: `${toolBoxName}/${name2}`,
        props: {},
        events: [],
        updateProperty: expect.any(Function)
      })

      component.$set({ name: faker.lorem.words() })
      await tick()
      expect(registerTool).toHaveBeenCalledTimes(2)
      expect(recordEvent).not.toHaveBeenCalled()
      expect(recordVisibility).not.toHaveBeenCalled()
    })

    it('passes toolbox props and tool props down to the component', async () => {
      const toolBox = {
        name: faker.lorem.words(),
        props: { disabled: true, label: faker.commerce.productName() },
        updateProperty: expect.any(Function)
      }
      const tool = {
        name: faker.lorem.words(),
        props: { label: faker.commerce.productName() },
        updateProperty: expect.any(Function)
      }
      currentTool.set({
        name: tool.name,
        fullName: `${toolBox.name}/${tool.name}`
      })
      render(
        html`<${ToolBox}
          name=${toolBox.name}
          component=${Button}
          props=${toolBox.props}
        >
          <${Tool} name=${tool.name} props=${tool.props} />
        </${ToolBox}>`
      )
      expect(registerTool).toHaveBeenCalledWith({
        name: tool.name,
        fullName: `${toolBox.name}/${tool.name}`,
        props: { ...toolBox.props, ...tool.props },
        events: [],
        updateProperty: expect.any(Function)
      })
      await waitFor(() =>
        expect(recordVisibility).toHaveBeenCalledWith({
          name: tool.name,
          fullName: `${toolBox.name}/${tool.name}`,
          visible: true
        })
      )
      expect(screen.queryByRole('button')).toBeInTheDocument()

      const button = screen.queryByRole('button')
      expect(button).toBeInTheDocument()
      expect(button).toHaveTextContent(tool.props.label)
      expect(button).toBeDisabled()
    })

    it('updates component props when invoking updateProperty()', async () => {
      const toolBox = { name: faker.lorem.words() }
      const tool = { name: faker.lorem.words() }
      currentTool.set({
        name: tool.name,
        fullName: `${toolBox.name}/${tool.name}`
      })
      render(
        html`<${ToolBox} name=${toolBox.name} component=${Button}>
          <${Tool} name=${tool.name} />
        </${ToolBox}>`
      )
      expect(registerTool).toHaveBeenCalledWith({
        name: tool.name,
        fullName: `${toolBox.name}/${tool.name}`,
        props: {},
        events: [],
        updateProperty: expect.any(Function)
      })
      await waitFor(() =>
        expect(recordVisibility).toHaveBeenCalledWith({
          name: tool.name,
          fullName: `${toolBox.name}/${tool.name}`,
          visible: true
        })
      )
      expect(screen.queryByRole('button')).toBeInTheDocument()

      const button = screen.queryByRole('button')
      expect(button).toBeInTheDocument()
      expect(button).toHaveTextContent('Hey oh!')

      const value = faker.commerce.productName()
      registerTool.mock.calls[0][0].updateProperty('label', value)

      await tick()
      expect(screen.queryByRole('button')).toHaveTextContent(value)
      expect(registerTool).toHaveBeenCalledTimes(1)
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
      currentTool.set({
        name: tool.name,
        fullName: `${toolBox.name}/${tool.name}`
      })
      render(
        html`<${ToolBox}
          name=${toolBox.name}
          component=${Button}
          events=${toolBox.events}
        >
          <${Tool} name=${tool.name} events=${tool.events} />
        </${ToolBox}>`
      )
      expect(registerTool).toHaveBeenCalledWith({
        name: tool.name,
        fullName: `${toolBox.name}/${tool.name}`,
        props: {},
        events: [...toolBox.events, ...tool.events],
        updateProperty: expect.any(Function)
      })
      await waitFor(() =>
        expect(recordVisibility).toHaveBeenCalledWith({
          name: tool.name,
          fullName: `${toolBox.name}/${tool.name}`,
          visible: true
        })
      )
      expect(screen.queryByRole('button')).toBeInTheDocument()

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
          html`<${ToolBox} name=${toolBoxName} component=${Button}>
            <${Tool} name=${name} component=${Button} />
          </${ToolBox}>`
        )
      ).toThrow(
        `Tool "${name}" does not support component property since its ToolBox "${toolBoxName}" already have one`
      )
    })

    it('calls toolbox setup, then tool setup before displaying it', async () => {
      const toolBoxName = faker.lorem.words()
      const name = faker.lorem.words()
      const fullName = `${toolBoxName}/${name}`
      const setup = jest.fn().mockResolvedValue()
      const toolSetup = jest.fn().mockResolvedValue()
      const props = { label: 'Aww yeah', disabled: true }
      render(html`<${ToolBox}
        name=${toolBoxName}
        component=${Button}
        props=${{ label: props.label }}
        setup=${setup}
      >
        <${Tool} name=${name} props=${{
        disabled: props.disabled
      }} setup=${toolSetup} />
      </${ToolBox}>`)
      await tick()

      expect(setup).not.toHaveBeenCalled()
      expect(toolSetup).not.toHaveBeenCalled()

      currentTool.set({ name, fullName })
      await tick()
      expect(setup).toHaveBeenCalledWith({ name, fullName, props })
      expect(setup).toHaveBeenCalledTimes(1)
      expect(toolSetup).not.toHaveBeenCalled()
      await waitFor(() =>
        expect(toolSetup).toHaveBeenCalledWith({ name, fullName, props })
      )
      expect(toolSetup).toHaveBeenCalledTimes(1)
      await waitFor(() =>
        expect(recordVisibility).toHaveBeenCalledWith({
          name,
          fullName,
          visible: true
        })
      )
    })

    it('calls setups on every tool change', async () => {
      const toolBoxName = faker.lorem.words()
      const name1 = faker.lorem.words()
      const fullName1 = `${toolBoxName}/${name1}`
      const props1 = { label: 'Aww yeah', disabled: true }
      const name2 = faker.lorem.words()
      const fullName2 = `${toolBoxName}/${name2}`
      const props2 = { label: 'Aww yeah', disabled: false }
      const setup = jest.fn().mockResolvedValue()
      const toolSetup1 = jest.fn().mockResolvedValue()
      const toolSetup2 = jest.fn().mockResolvedValue()
      render(html`<${ToolBox}
        name=${toolBoxName}
        component=${Button}
        props=${{ label: props1.label }}
        setup=${setup}
      >
        <${Tool} name=${name1} props=${{
        disabled: props1.disabled
      }} setup=${toolSetup1} />
        <${Tool} name=${name2} props=${{
        disabled: props2.disabled
      }} setup=${toolSetup2} />
      </${ToolBox}>`)
      await tick()

      expect(setup).not.toHaveBeenCalled()
      expect(toolSetup1).not.toHaveBeenCalled()
      expect(toolSetup2).not.toHaveBeenCalled()

      currentTool.set({ name: name1, fullName: fullName1 })
      await tick()
      expect(setup).toHaveBeenCalledWith({
        name: name1,
        fullName: fullName1,
        props: props1
      })
      expect(setup).toHaveBeenCalledTimes(1)
      expect(toolSetup1).not.toHaveBeenCalled()
      await waitFor(() =>
        expect(toolSetup1).toHaveBeenCalledWith({
          name: name1,
          fullName: fullName1,
          props: props1
        })
      )
      expect(toolSetup1).toHaveBeenCalledTimes(1)
      expect(toolSetup2).not.toHaveBeenCalled()
      expect(recordVisibility).toHaveBeenNthCalledWith(1, {
        name: name1,
        fullName: fullName1,
        visible: true
      })

      setup.mockClear()
      toolSetup1.mockClear()

      currentTool.set({ name: name2, fullName: fullName2 })
      await tick()
      expect(setup).toHaveBeenCalledWith({
        name: name2,
        fullName: fullName2,
        props: props2
      })
      expect(setup).toHaveBeenCalledTimes(1)
      expect(toolSetup2).not.toHaveBeenCalled()
      await waitFor(() =>
        expect(toolSetup2).toHaveBeenCalledWith({
          name: name2,
          fullName: fullName2,
          props: props2
        })
      )
      expect(toolSetup2).toHaveBeenCalledTimes(1)
      expect(recordVisibility).toHaveBeenNthCalledWith(2, {
        name: name1,
        fullName: fullName1,
        visible: false
      })
      expect(toolSetup1).not.toHaveBeenCalled()
      expect(recordVisibility).toHaveBeenNthCalledWith(3, {
        name: name2,
        fullName: fullName2,
        visible: true
      })
    })

    it('calls tool teardown, then toolbox teardown after destroying it', async () => {
      const toolBoxName = faker.lorem.words()
      const name = faker.lorem.words()
      const teardown = jest.fn().mockResolvedValue()
      const toolTeardown = jest.fn().mockResolvedValue()
      currentTool.set({ name, fullName: `${toolBoxName}/${name}` })
      render(html`<${ToolBox}
        name=${toolBoxName}
        component=${Button}
        teardown=${teardown}
      >
        <${Tool} name=${name} teardown=${toolTeardown} />
      </${ToolBox}>`)
      await waitFor(() =>
        expect(recordVisibility).toHaveBeenNthCalledWith(1, {
          name,
          fullName: `${toolBoxName}/${name}`,
          visible: true
        })
      )
      expect(screen.queryByRole('button')).toBeInTheDocument()

      expect(teardown).not.toHaveBeenCalled()
      expect(toolTeardown).not.toHaveBeenCalled()

      currentTool.set({ name: 'whatever', fullName: 'whatever' })
      await waitFor(() =>
        expect(screen.queryByRole('button')).not.toBeInTheDocument()
      )
      expect(toolTeardown).toHaveBeenCalledTimes(1)
      expect(teardown).not.toHaveBeenCalled()
      await waitFor(() =>
        expect(recordVisibility).toHaveBeenNthCalledWith(2, {
          name,
          fullName: `${toolBoxName}/${name}`,
          visible: false
        })
      )
      expect(teardown).toHaveBeenCalledTimes(1)
      expect(recordVisibility).toHaveBeenCalledTimes(2)
    })

    it('calls teardowns on every tool change', async () => {
      const toolBoxName = faker.lorem.words()
      const name1 = faker.lorem.words()
      const name2 = faker.lorem.words()
      const teardown = jest.fn().mockResolvedValue()
      const toolTeardown1 = jest.fn().mockResolvedValue()
      const toolTeardown2 = jest.fn().mockResolvedValue()
      currentTool.set({ name: name1, fullName: `${toolBoxName}/${name1}` })
      render(html`<${ToolBox}
        name=${toolBoxName}
        component=${Button}
        teardown=${teardown}
      >
        <${Tool} name=${name1} teardown=${toolTeardown1} />
        <${Tool} name=${name2} teardown=${toolTeardown2} />
      </${ToolBox}>`)
      await waitFor(() =>
        expect(recordVisibility).toHaveBeenNthCalledWith(1, {
          name: name1,
          fullName: `${toolBoxName}/${name1}`,
          visible: true
        })
      )
      expect(screen.queryByRole('button')).toBeInTheDocument()
      expect(teardown).not.toHaveBeenCalled()
      expect(toolTeardown1).not.toHaveBeenCalled()
      expect(toolTeardown2).not.toHaveBeenCalled()

      currentTool.set({ name: name2, fullName: `${toolBoxName}/${name2}` })
      await waitFor(() => expect(toolTeardown1).toHaveBeenCalledTimes(1))
      expect(teardown).not.toHaveBeenCalled()
      await waitFor(() => expect(teardown).toHaveBeenCalledTimes(1))
      expect(toolTeardown2).not.toHaveBeenCalled()
      expect(recordVisibility).toHaveBeenNthCalledWith(2, {
        name: name2,
        fullName: `${toolBoxName}/${name2}`,
        visible: true
      })
      await waitFor(() =>
        expect(recordVisibility).toHaveBeenNthCalledWith(3, {
          name: name1,
          fullName: `${toolBoxName}/${name1}`,
          visible: false
        })
      )

      teardown.mockClear()
      toolTeardown1.mockClear()

      currentTool.set({ name: name1, fullName: `${toolBoxName}/${name1}` })
      await waitFor(() => expect(toolTeardown2).toHaveBeenCalledTimes(1))
      expect(teardown).not.toHaveBeenCalled()
      await waitFor(() => expect(teardown).toHaveBeenCalledTimes(1))
      expect(toolTeardown1).not.toHaveBeenCalled()
      expect(recordVisibility).toHaveBeenNthCalledWith(4, {
        name: name1,
        fullName: `${toolBoxName}/${name1}`,
        visible: true
      })
      await waitFor(() =>
        expect(recordVisibility).toHaveBeenNthCalledWith(5, {
          name: name2,
          fullName: `${toolBoxName}/${name2}`,
          visible: false
        })
      )
      expect(recordVisibility).toHaveBeenCalledTimes(5)
    })
  })
})
