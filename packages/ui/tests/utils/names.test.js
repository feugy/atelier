import { groupByName } from '../../src/utils'

beforeEach(jest.resetAllMocks)

describe('groupByName() utility', () => {
  it('handles no tools', () => {
    expect(groupByName()).toEqual(new Map())
  })

  it('does not group tools without parents', () => {
    const tools = [
      { fullName: 'tool1' },
      { fullName: 'tool2' },
      { fullName: 'tool3' }
    ]
    expect(groupByName(tools)).toEqual(
      new Map(tools.map(tool => [tool.fullName, tool]))
    )
  })

  it('splits parents', () => {
    const tools = [
      { fullName: 'a/tool1' },
      { fullName: 'tool2' },
      { fullName: 'b/c/tool3' }
    ]
    expect(groupByName(tools)).toEqual(
      new Map([
        ['a', new Map([['tool1', tools[0]]])],
        ['tool2', tools[1]],
        ['b', new Map([['c', new Map([['tool3', tools[2]]])]])]
      ])
    )
  })

  it('group parents', () => {
    const tools = [
      { fullName: 'a/tool1' },
      { fullName: 'tool2' },
      { fullName: 'a/c/tool3' }
    ]
    expect(groupByName(tools)).toEqual(
      new Map([
        [
          'a',
          new Map([
            ['tool1', tools[0]],
            ['c', new Map([['tool3', tools[2]]])]
          ])
        ],
        ['tool2', tools[1]]
      ])
    )
  })

  it('can group without name', () => {
    const tools = [
      { fullName: 'a/tool1' },
      { fullName: 'a' },
      { fullName: 'a/c/tool3' },
      { fullName: 'b' },
      { fullName: 'b/tool2' }
    ]
    expect(groupByName(tools)).toEqual(
      new Map([
        [
          'a',
          new Map([
            ['tool1', tools[0]],
            ['no-name', tools[1]],
            ['c', new Map([['tool3', tools[2]]])]
          ])
        ],
        [
          'b',
          new Map([
            ['no-name', tools[3]],
            ['tool2', tools[4]]
          ])
        ]
      ])
    )
  })
})
