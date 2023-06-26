import { faker } from '@faker-js/faker'
import { fireEvent, render, screen } from '@testing-library/svelte'
import html from 'svelte-htm'
import { PropertiesPane } from '../../src/connected-components'
import { currentTool, updateProperty } from '../../src/stores'

vi.mock('../../src/stores/tools', () => {
  const { BehaviorSubject } = require('rxjs')
  return {
    currentTool: new BehaviorSubject(),
    updateProperty: vi.fn()
  }
})

describe('PropertiesPane connected component', () => {
  beforeEach(vi.resetAllMocks)

  it('can edit a text property', async () => {
    const name = faker.lorem.word()
    const value = faker.lorem.words()
    currentTool.next({ props: { [name]: value } })
    render(html`<${PropertiesPane} />`)

    const input = screen.queryByRole('textbox')
    expect(input).toHaveValue(value)
    expect(updateProperty).not.toHaveBeenCalled()

    const newValue = faker.lorem.words()
    await fireEvent.input(input, { target: { value: newValue } })
    expect(updateProperty).toHaveBeenCalledWith(
      expect.objectContaining({ detail: { name, value: newValue } })
    )
    expect(updateProperty).toHaveBeenCalledTimes(1)
  })

  it('can edit a boolean property', async () => {
    const name = faker.lorem.word()
    const value = true
    currentTool.next({ props: { [name]: value } })
    render(html`<${PropertiesPane} />`)

    const input = screen.queryByRole('checkbox')
    expect(input).toBeChecked(value)
    expect(updateProperty).not.toHaveBeenCalled()

    await fireEvent.change(input, { target: { checked: false } })
    expect(updateProperty).toHaveBeenCalledWith(
      expect.objectContaining({ detail: { name, value: false } })
    )

    await fireEvent.change(input, { target: { checked: true } })
    expect(updateProperty).toHaveBeenCalledWith(
      expect.objectContaining({ detail: { name, value: true } })
    )
    expect(updateProperty).toHaveBeenCalledTimes(2)
  })

  it('can edit a numeric property', async () => {
    const name = faker.lorem.word()
    const value = faker.helpers.arrayElement([-12.5, 0.25, 7.35])
    currentTool.next({ props: { [name]: value } })
    render(html`<${PropertiesPane} />`)

    const input = screen.queryByRole('spinbutton')
    expect(input).toHaveValue(value)
    expect(updateProperty).not.toHaveBeenCalled()

    const newValue = faker.number.int(999)
    await fireEvent.change(input, { target: { value: newValue } })
    expect(updateProperty).toHaveBeenCalledWith(
      expect.objectContaining({ detail: { name, value: newValue } })
    )
    expect(updateProperty).toHaveBeenCalledTimes(1)
  })

  it('can edit a array property', async () => {
    const name = faker.lorem.word()
    const value = [1, 2, 3]
    currentTool.next({ props: { [name]: value } })
    render(html`<${PropertiesPane} />`)

    const input = screen.queryByRole('textbox')
    expect(input).toHaveValue(JSON.stringify(value, null, 2))
    expect(updateProperty).not.toHaveBeenCalled()

    await fireEvent.input(input, {
      target: { value: `does not parse as array` }
    })
    expect(updateProperty).not.toHaveBeenCalled()

    const newValue = [4, 6]
    await fireEvent.input(input, {
      target: { value: JSON.stringify(newValue) }
    })
    expect(updateProperty).toHaveBeenCalledWith(
      expect.objectContaining({ detail: { name, value: newValue } })
    )
    expect(updateProperty).toHaveBeenCalledTimes(1)
  })

  it('can edit a object property', async () => {
    const name = faker.lorem.word()
    const value = { foo: { bar: 'baz' } }
    currentTool.next({ props: { [name]: value } })
    render(html`<${PropertiesPane} />`)

    const input = screen.queryByRole('textbox')
    expect(input).toHaveValue(JSON.stringify(value, null, 2))
    expect(updateProperty).not.toHaveBeenCalled()

    await fireEvent.input(input, {
      target: { value: `does not parse as object` }
    })
    expect(updateProperty).not.toHaveBeenCalled()

    const newValue = { baz: { bar: 'foo' } }
    await fireEvent.input(input, {
      target: { value: JSON.stringify(newValue) }
    })
    expect(updateProperty).toHaveBeenCalledWith(
      expect.objectContaining({ detail: { name, value: newValue } })
    )
    expect(updateProperty).toHaveBeenCalledTimes(1)
  })

  it('displays multiple properties', () => {
    const props = {
      booleanProp: true,
      textProp: faker.lorem.words(),
      numberProp: faker.number.int(999)
    }
    currentTool.next({ props })
    render(html`<${PropertiesPane} />`)

    const textbox = screen.queryByRole('textbox')
    expect(textbox).toHaveValue(props.text)
    expect(textbox.previousElementSibling).toHaveTextContent('textProp')

    const checkbox = screen.queryByRole('checkbox')
    expect(checkbox).toBeChecked()
    expect(checkbox.previousElementSibling).toHaveTextContent('booleanProp')

    const spinbutton = screen.queryByRole('spinbutton')
    expect(spinbutton).toHaveValue(props.number)
    expect(spinbutton.previousElementSibling).toHaveTextContent('numberProp')
  })
})
