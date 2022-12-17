import { faker } from '@faker-js/faker'
import { fireEvent, render, screen, within } from '@testing-library/svelte'
import { readable } from 'svelte/store'
import html from 'svelte-htm'
import { translate } from '../test-utils'
import { Pane1, Pane2, Pane3 } from '../test-components'
import { PaneContainer } from '../../src/components'

describe('PaneContainer component', () => {
  it('display tabs and can switch between them', async () => {
    const tabs = [
      {
        name: faker.lorem.word(),
        component: Pane1.default,
        isEnabled: Pane1.isEnabled
      },
      {
        name: faker.lorem.word(),
        component: Pane2.default,
        isEnabled: Pane2.isEnabled
      },
      {
        name: faker.lorem.word(),
        component: Pane3.default,
        isEnabled: Pane3.isEnabled
      }
    ]
    const tool = readable({
      allowPane1: true,
      allowPane2: true,
      allowPane3: true
    })
    render(html`<${PaneContainer} tabs=${tabs} currentTool=${tool} />`)

    const tabItems = screen.queryAllByRole('tab')
    expect(tabItems[0]).toHaveTextContent(tabs[0].name)
    expect(tabItems[1]).toHaveTextContent(tabs[1].name)
    expect(tabItems[2]).toHaveTextContent(tabs[2].name)
    expect(tabItems).toHaveLength(3)
    const main = screen.getByRole('main')
    expect(main).toHaveTextContent('This is pane #1')

    await fireEvent.click(tabItems[2])
    expect(main).toHaveTextContent('This is pane #3')
  })

  it('does not display disabled tabs', async () => {
    const tabs = [
      {
        name: faker.lorem.word(),
        component: Pane1.default,
        isEnabled: Pane1.isEnabled
      },
      {
        name: faker.lorem.word(),
        component: Pane2.default,
        isEnabled: Pane2.isEnabled
      },
      {
        name: faker.lorem.word(),
        component: Pane3.default,
        isEnabled: Pane3.isEnabled
      }
    ]
    const tool = readable({
      allowPane2: true,
      allowPane3: true
    })
    render(html`<${PaneContainer} tabs=${tabs} currentTool=${tool} />`)

    const tabItems = screen.queryAllByRole('tab')
    expect(tabItems[0]).toHaveTextContent(tabs[1].name)
    expect(tabItems[1]).toHaveTextContent(tabs[2].name)
    expect(tabItems).toHaveLength(2)
    const main = screen.getByRole('main')
    expect(main).toHaveTextContent('This is pane #2')

    await fireEvent.click(tabItems[1])
    expect(main).toHaveTextContent('This is pane #3')
  })

  it('is collapsed when all tabs are disabled', () => {
    const tabs = [
      {
        name: faker.lorem.word(),
        component: Pane1.default,
        isEnabled: Pane1.isEnabled
      },
      {
        name: faker.lorem.word(),
        component: Pane2.default,
        isEnabled: Pane2.isEnabled
      }
    ]
    const tool = readable({})
    render(html`<${PaneContainer} tabs=${tabs} currentTool=${tool} />`)
    expect(screen.getByRole('listitem')).toBeInTheDocument()

    const main = screen.getByRole('main')
    expect(main).toHaveClass('collapsed')
    expect(main).toHaveTextContent(translate('message.no-pane-enabled'))
  })

  it('can collapse and expand', async () => {
    const tabs = [
      {
        name: faker.lorem.word(),
        component: Pane1.default,
        isEnabled: Pane1.isEnabled
      },
      {
        name: faker.lorem.word(),
        component: Pane2.default,
        isEnabled: Pane2.isEnabled
      }
    ]
    const tool = readable({ allowPane1: true, allowPane2: true })
    render(html`<${PaneContainer} tabs=${tabs} currentTool=${tool} />`)

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
