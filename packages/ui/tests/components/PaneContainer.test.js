import { faker } from '@faker-js/faker'
import { fireEvent, render, screen, within } from '@testing-library/svelte'
import { tick } from 'svelte'
import { readable } from 'svelte/store'
import html from 'svelte-htm'
import { describe, expect, it } from 'vitest'

import { PaneContainer } from '../../src/components'
import { Pane1, Pane2, Pane3 } from '../test-components'
import { translate } from '../test-utils'

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

    fireEvent.click(tabItems[2])
    await tick()
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

    fireEvent.click(tabItems[1])
    await tick()
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

    fireEvent.click(collapseButton)
    await tick()
    expect(main).toHaveClass('collapsed')

    fireEvent.click(collapseButton)
    await tick()
    expect(main).not.toHaveClass('collapsed')

    fireEvent.dblClick(tabBar)
    await tick()
    expect(main).toHaveClass('collapsed')

    fireEvent.dblClick(tabBar)
    await tick()
    expect(main).not.toHaveClass('collapsed')
  })
})
