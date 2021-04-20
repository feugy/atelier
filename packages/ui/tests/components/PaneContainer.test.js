import { fireEvent, render, screen, within } from '@testing-library/svelte'
import faker from 'faker'
import html from 'svelte-htm'
import TestButton from './TestButton.svelte'
import { PaneContainer } from '../../src/components'

describe('PaneContainer component', () => {
  it('display tabs and can switch between them', async () => {
    const tabs = [
      {
        name: faker.lorem.word(),
        content: TestButton,
        props: { label: faker.commerce.productName() }
      },
      {
        name: faker.lorem.word(),
        content: TestButton,
        props: { label: faker.commerce.productName() }
      },
      {
        name: faker.lorem.word(),
        content: faker.commerce.productName()
      }
    ]
    render(html`<${PaneContainer} tabs=${tabs} />`)

    const tabItems = screen.queryAllByRole('listitem')
    expect(tabItems[0]).toHaveTextContent(tabs[0].name)
    expect(tabItems[1]).toHaveTextContent(tabs[1].name)
    expect(tabItems[2]).toHaveTextContent(tabs[2].name)
    const main = screen.getByRole('main')
    expect(within(main).queryAllByRole('button')).toHaveLength(1)
    expect(within(main).getByRole('button')).toHaveTextContent(
      tabs[0].props.label
    )

    await fireEvent.click(tabItems[2])
    expect(within(main).queryAllByRole('button')).toHaveLength(0)
    expect(main).toHaveTextContent(tabs[2].content)
  })

  it('can collapse and expand', async () => {
    const tabs = [
      {
        name: faker.lorem.word(),
        content: TestButton,
        props: { label: faker.commerce.productName() }
      },
      {
        name: faker.lorem.word(),
        content: TestButton,
        props: { label: faker.commerce.productName() }
      }
    ]
    render(html`<${PaneContainer} tabs=${tabs} />`)

    const tabBar = screen.queryByRole('navigation')
    const collapseButton = within(tabBar).getByRole('button')
    const main = screen.getByRole('main')
    expect(main).not.toHaveClass('collapsed')

    await fireEvent.click(collapseButton)
    expect(main).toHaveClass('collapsed')

    await fireEvent.click(collapseButton)
    expect(main).not.toHaveClass('collapsed')

    await fireEvent.dblClick(tabBar)
    expect(main).toHaveClass('collapsed')

    await fireEvent.dblClick(tabBar)
    expect(main).not.toHaveClass('collapsed')
  })
})
