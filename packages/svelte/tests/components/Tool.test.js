import { faker } from '@faker-js/faker'
import { fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import { get, writable } from 'svelte/store'
import { tick } from 'svelte'
import html from 'svelte-htm'
import { Button } from '../test-components'
import { Tool, ToolBox } from '../../src'
import {
  currentTool,
  registerTool,
  recordError,
  recordEvent,
  recordVisibility
} from '../../src/stores'

vi.mock('../../src/stores', () => {
  const { writable } = require('svelte/store')
  return {
    currentTool: new writable(),
    registerTool: vi.fn(),
    recordError: vi.fn(),
    recordEvent: vi.fn(),
    recordVisibility: vi.fn()
  }
})

describe('Tool component', () => {
  beforeEach(vi.resetAllMocks)

  describe('given no toolbox', () => {
    it('needs a name', () => {
      const message = 'Tool needs a name property'
      render(html`<${Tool} />`)
      expect(screen.getByRole('generic')).toHaveTextContent(message)
      expect(recordError).toHaveBeenCalledWith(
        expect.objectContaining({ message })
      )
    })

    it('registers tool and renders component when being current', async () => {
      const name = faker.lorem.words()
      currentTool.set({ fullName: name, name })
      const data = { foo: faker.datatype.uuid() }
      const custom = [faker.datatype.number(), faker.datatype.number()]
      render(
        html`<${Tool}
          name=${name}
          component=${Button}
          custom=${custom}
          data=${data}
        />`
      )
      await waitFor(() =>
        expect(recordVisibility).toHaveBeenCalledWith({
          name,
          fullName: name,
          visible: true
        })
      )

      expect(screen.getByRole('button')).toBeInTheDocument()
      expect(registerTool).toHaveBeenCalledWith({
        name,
        fullName: name,
        props: {},
        events: [],
        updateProperty: expect.any(Function),
        data: { data, custom }
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
        updateProperty: expect.any(Function),
        data: {}
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
        updateProperty: expect.any(Function),
        data: {}
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
        updateProperty: expect.any(Function),
        data: {}
      })
      expect(registerTool).toHaveBeenCalledTimes(1)

      await waitFor(() =>
        expect(recordVisibility).toHaveBeenCalledWith({
          name,
          fullName: name,
          visible: true
        })
      )
      expect(screen.getByRole('button')).toBeInTheDocument()
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
        updateProperty: expect.any(Function),
        data: {}
      })
      expect(registerTool).toHaveBeenCalledTimes(1)

      await waitFor(() =>
        expect(recordVisibility).toHaveBeenCalledWith({
          name,
          fullName: name,
          visible: true
        })
      )
      expect(screen.getByRole('button')).toBeInTheDocument()
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
        updateProperty: expect.any(Function),
        data: {}
      })

      await waitFor(() =>
        expect(recordVisibility).toHaveBeenCalledWith({
          name,
          fullName: name,
          visible: true
        })
      )
      expect(screen.getByRole('button')).toBeInTheDocument()
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
        updateProperty: expect.any(Function),
        data: {}
      })
      await waitFor(() =>
        expect(recordVisibility).toHaveBeenCalledWith({
          name,
          fullName: name,
          visible: true
        })
      )
      expect(screen.getByRole('button')).toBeInTheDocument()
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
        updateProperty: expect.any(Function),
        data: {}
      })
      await waitFor(() =>
        expect(recordVisibility).toHaveBeenCalledWith({
          name,
          fullName: name,
          visible: true
        })
      )
      expect(screen.getByRole('button')).toBeInTheDocument()

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
        updateProperty: expect.any(Function),
        data: {}
      })
      expect(recordEvent).not.toHaveBeenCalled()
      await waitFor(() =>
        expect(recordVisibility).toHaveBeenCalledWith({
          name,
          fullName: name,
          visible: true
        })
      )
      expect(screen.getByRole('button')).toBeInTheDocument()

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
      expect(screen.getByText(header)).toBeInTheDocument()
      expect(screen.getByRole('button')).toBeInTheDocument()
      expect(screen.getByText(footer)).toBeInTheDocument()
    })

    it('calls tool setup before displaying it', async () => {
      const name = faker.lorem.words()
      const setup = vi.fn().mockResolvedValue()
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
      const button = screen.queryByRole('button')
      expect(button).toBeInTheDocument()
      expect(button).toHaveTextContent(props.label)
    })

    it('overrides props with setup results', async () => {
      const name = faker.lorem.words()
      const props = { label: 'Aww yeah' }
      const finalProps = { label: 'overridden' }
      const setup = vi.fn().mockResolvedValue(finalProps)
      currentTool.set({ fullName: name, name })
      render(
        html`<${Tool}
          name=${name}
          component=${Button}
          props=${props}
          setup=${setup}
        />`
      )
      await waitFor(() =>
        expect(recordVisibility).toHaveBeenCalledWith({
          name,
          fullName: name,
          visible: true
        })
      )
      expect(setup).toHaveBeenCalledWith({ name, fullName: name, props })
      expect(setup).toHaveBeenCalledTimes(1)
      const button = screen.queryByRole('button')
      expect(button).toBeInTheDocument()
      expect(button).toHaveTextContent(finalProps.label)
    })

    it('calls tool setup before displaying within a slot', async () => {
      const name = faker.lorem.words()
      const setup = vi.fn().mockResolvedValue()
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
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('calls tool teardown after destroying it', async () => {
      const name = faker.lorem.words()
      const teardown = vi.fn().mockResolvedValue()
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
      expect(screen.getByRole('button')).toBeInTheDocument()
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
      const teardown = vi.fn().mockResolvedValue()
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
      expect(screen.getByRole('button')).toBeInTheDocument()
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
      const message = 'Tool needs a name property'
      render(html`<${ToolBox} name=${name}><${Tool} /></`)
      expect(screen.getByRole('generic')).toHaveTextContent(message)
      expect(recordError).toHaveBeenCalledWith(
        expect.objectContaining({ message })
      )
    })

    it('registers tool and renders component when being current', async () => {
      const name = faker.lorem.words()
      const toolBoxName = faker.lorem.words()
      const data = { foo: faker.datatype.uuid() }
      const toolData = { bar: faker.datatype.uuid() }
      const custom = [faker.datatype.number(), faker.datatype.number()]
      currentTool.set({ name, fullName: `${toolBoxName}/${name}` })
      render(
        html`<${ToolBox} name=${toolBoxName} component=${Button} data=${data} custom=${custom}>
          <${Tool} name=${name} data=${toolData}/>
        </${ToolBox}>`
      )
      await waitFor(() =>
        expect(recordVisibility).toHaveBeenCalledWith({
          name,
          fullName: `${toolBoxName}/${name}`,
          visible: true
        })
      )
      expect(screen.getByRole('button')).toBeInTheDocument()
      expect(registerTool).toHaveBeenCalledWith({
        name,
        fullName: `${toolBoxName}/${name}`,
        props: {},
        events: [],
        updateProperty: expect.any(Function),
        data: { data: toolData, custom }
      })
      expect(registerTool).toHaveBeenCalledTimes(1)
      expect(recordEvent).not.toHaveBeenCalled()
      const tool = screen.getByRole('button').parentElement.parentElement
      expect(tool).toHaveClass('tool')
    })

    it('registers tool and renders nothing', async () => {
      const name1 = faker.lorem.words()
      const name2 = faker.lorem.words()
      const toolBoxName = faker.lorem.words()
      const data = { foo: faker.lorem.words() }
      const toolData = { bar: faker.lorem.words() }
      const custom = [faker.datatype.uuid()]
      const other = faker.commerce.productName()
      render(
        html`<${ToolBox} name=${toolBoxName} component=${Button} data=${data} custom=${custom}>
          <${Tool} name=${name1} data=${toolData} />
          <${Tool} name=${name2} other=${other} />
        </${ToolBox}>`
      )
      expect(registerTool).toHaveBeenCalledWith({
        name: name1,
        fullName: `${toolBoxName}/${name1}`,
        props: {},
        events: [],
        updateProperty: expect.any(Function),
        data: {
          data: toolData,
          custom: custom
        }
      })
      expect(registerTool).toHaveBeenCalledWith({
        name: name2,
        fullName: `${toolBoxName}/${name2}`,
        props: {},
        events: [],
        updateProperty: expect.any(Function),
        data: {
          data: data,
          custom: custom,
          other: other
        }
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
        updateProperty: expect.any(Function),
        data: {}
      })
      expect(registerTool).toHaveBeenCalledWith({
        name: name2,
        fullName: `${toolBoxName}/${name2}`,
        props: {},
        events: [],
        updateProperty: expect.any(Function),
        data: {}
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
        updateProperty: expect.any(Function),
        data: {}
      })
      await waitFor(() =>
        expect(recordVisibility).toHaveBeenCalledWith({
          name: tool.name,
          fullName: `${toolBox.name}/${tool.name}`,
          visible: true
        })
      )
      expect(screen.getByRole('button')).toBeInTheDocument()

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
        updateProperty: expect.any(Function),
        data: {}
      })
      await waitFor(() =>
        expect(recordVisibility).toHaveBeenCalledWith({
          name: tool.name,
          fullName: `${toolBox.name}/${tool.name}`,
          visible: true
        })
      )
      expect(screen.getByRole('button')).toBeInTheDocument()

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
        updateProperty: expect.any(Function),
        data: {}
      })
      await waitFor(() =>
        expect(recordVisibility).toHaveBeenCalledWith({
          name: tool.name,
          fullName: `${toolBox.name}/${tool.name}`,
          visible: true
        })
      )
      expect(screen.getByRole('button')).toBeInTheDocument()

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
      const message = `Tool "${name}" does not support component property since its ToolBox "${toolBoxName}" already have one`

      render(
        html`<${ToolBox} name=${toolBoxName} component=${Button}>
            <${Tool} name=${name} component=${Button} />
          </${ToolBox}>`
      )
      expect(screen.getByRole('generic')).toHaveTextContent(message)
      expect(recordError).toHaveBeenCalledWith(
        expect.objectContaining({ message })
      )
    })

    it('calls toolbox setup, then tool setup before displaying it', async () => {
      const toolBoxName = faker.lorem.words()
      const name = faker.lorem.words()
      const fullName = `${toolBoxName}/${name}`
      const setup = vi.fn().mockResolvedValue()
      const toolSetup = vi.fn().mockResolvedValue()
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

    it('overrides props with setup results', async () => {
      const toolBoxName = faker.lorem.words()
      const name = faker.lorem.words()
      const fullName = `${toolBoxName}/${name}`
      const props = { label: 'Aww yeah', disabled: true }
      const intermediateProps = { label: 'intermediate' }
      const finalProps = { label: 'overridden' }
      const setup = vi.fn().mockResolvedValue(intermediateProps)
      const toolSetup = vi.fn().mockResolvedValue(finalProps)
      currentTool.set({ fullName, name })
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
      await waitFor(() =>
        expect(recordVisibility).toHaveBeenCalledWith({
          name,
          fullName,
          visible: true
        })
      )
      expect(setup).toHaveBeenCalledWith({ name, fullName, props })
      expect(setup).toHaveBeenCalledTimes(1)
      expect(toolSetup).toHaveBeenCalledWith({
        name,
        fullName,
        props: intermediateProps
      })
      expect(toolSetup).toHaveBeenCalledTimes(1)
      const button = screen.queryByRole('button')
      expect(button).toBeInTheDocument()
      expect(button).toHaveTextContent(finalProps.label)
    })

    it('calls setups on every tool change', async () => {
      const toolBoxName = faker.lorem.words()
      const name1 = faker.lorem.words()
      const fullName1 = `${toolBoxName}/${name1}`
      const props1 = { label: 'Aww yeah', disabled: true }
      const name2 = faker.lorem.words()
      const fullName2 = `${toolBoxName}/${name2}`
      const props2 = { label: 'Aww yeah', disabled: false }
      const setup = vi.fn().mockResolvedValue()
      const toolSetup1 = vi.fn().mockResolvedValue()
      const toolSetup2 = vi.fn().mockResolvedValue()
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
      const teardown = vi.fn().mockResolvedValue()
      const toolTeardown = vi.fn().mockResolvedValue()
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
      expect(screen.getByRole('button')).toBeInTheDocument()

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
      const teardown = vi.fn().mockResolvedValue()
      const toolTeardown1 = vi.fn().mockResolvedValue()
      const toolTeardown2 = vi.fn().mockResolvedValue()
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
      expect(screen.getByRole('button')).toBeInTheDocument()
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
