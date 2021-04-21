import { fireEvent, render, screen } from '@testing-library/svelte'
import faker from 'faker'
import html from 'svelte-htm'
import { Properties } from '../../src/components'

describe('Properties component', () => {
  it('can edit a text property', async () => {
    const handleChange = jest.fn()
    const name = faker.lorem.word()
    const value = faker.lorem.words()
    render(
      html`<${Properties}
        properties=${{ [name]: value }}
        on:prop-change=${handleChange}
      />`
    )

    const input = screen.queryByRole('textbox')
    expect(input).toHaveValue(value)
    expect(handleChange).not.toHaveBeenCalled()

    const newValue = faker.lorem.words()
    await fireEvent.input(input, { target: { value: newValue } })
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({ detail: { name, value: newValue } })
    )
    expect(handleChange).toHaveBeenCalledTimes(1)
  })

  it('can edit a boolean property', async () => {
    const handleChange = jest.fn()
    const name = faker.lorem.word()
    const value = true
    render(
      html`<${Properties}
        properties=${{ [name]: value }}
        on:prop-change=${handleChange}
      />`
    )

    const input = screen.queryByRole('checkbox')
    expect(input).toBeChecked(value)
    expect(handleChange).not.toHaveBeenCalled()

    await fireEvent.change(input, { target: { checked: false } })
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({ detail: { name, value: false } })
    )

    await fireEvent.change(input, { target: { checked: true } })
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({ detail: { name, value: true } })
    )
    expect(handleChange).toHaveBeenCalledTimes(2)
  })

  it('can edit a numeric property', async () => {
    const handleChange = jest.fn()
    const name = faker.lorem.word()
    const value = faker.random.arrayElement([-12.5, 0.25, 7.35])
    render(
      html`<${Properties}
        properties=${{ [name]: value }}
        on:prop-change=${handleChange}
      />`
    )

    const input = screen.queryByRole('spinbutton')
    expect(input).toHaveValue(value)
    expect(handleChange).not.toHaveBeenCalled()

    const newValue = faker.datatype.number()
    await fireEvent.change(input, { target: { value: newValue } })
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({ detail: { name, value: newValue } })
    )
    expect(handleChange).toHaveBeenCalledTimes(1)
  })

  it('can edit a array property', async () => {
    const handleChange = jest.fn()
    const name = faker.lorem.word()
    const value = [1, 2, 3]
    render(
      html`<${Properties}
        properties=${{ [name]: value }}
        on:prop-change=${handleChange}
      />`
    )

    const input = screen.queryByRole('textbox')
    expect(input).toHaveValue(JSON.stringify(value, null, 2))
    expect(handleChange).not.toHaveBeenCalled()

    await fireEvent.input(input, {
      target: { value: `does not parse as array` }
    })
    expect(handleChange).not.toHaveBeenCalled()

    const newValue = [4, 6]
    await fireEvent.input(input, {
      target: { value: JSON.stringify(newValue) }
    })
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({ detail: { name, value: newValue } })
    )
    expect(handleChange).toHaveBeenCalledTimes(1)
  })

  it('can edit a object property', async () => {
    const handleChange = jest.fn()
    const name = faker.lorem.word()
    const value = { foo: { bar: 'baz' } }
    render(
      html`<${Properties}
        properties=${{ [name]: value }}
        on:prop-change=${handleChange}
      />`
    )

    const input = screen.queryByRole('textbox')
    expect(input).toHaveValue(JSON.stringify(value, null, 2))
    expect(handleChange).not.toHaveBeenCalled()

    await fireEvent.input(input, {
      target: { value: `does not parse as object` }
    })
    expect(handleChange).not.toHaveBeenCalled()

    const newValue = { baz: { bar: 'foo' } }
    await fireEvent.input(input, {
      target: { value: JSON.stringify(newValue) }
    })
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({ detail: { name, value: newValue } })
    )
    expect(handleChange).toHaveBeenCalledTimes(1)
  })

  it('displays multiple properties', () => {
    const properties = {
      booleanProp: true,
      textProp: faker.lorem.words(),
      numberProp: faker.datatype.number()
    }
    render(html`<${Properties} properties=${properties} />`)

    const textbox = screen.queryByRole('textbox')
    expect(textbox).toHaveValue(properties.text)
    expect(textbox.previousElementSibling).toHaveTextContent('textProp')

    const checkbox = screen.queryByRole('checkbox')
    expect(checkbox).toBeChecked()
    expect(checkbox.previousElementSibling).toHaveTextContent('booleanProp')

    const spinbutton = screen.queryByRole('spinbutton')
    expect(spinbutton).toHaveValue(properties.number)
    expect(spinbutton.previousElementSibling).toHaveTextContent('numberProp')
  })
})
