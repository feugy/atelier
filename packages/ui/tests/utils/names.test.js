import { beforeEach, describe, expect, it, vi } from 'vitest'

import { groupByName } from '../../src/utils'

beforeEach(() => vi.resetAllMocks())

describe('groupByName() utility', () => {
  it('handles no tools', () => {
    expect(groupByName()).toEqual([])
  })

  it('does not group tools without parents', () => {
    const tools = [
      { fullName: 'tool1' },
      { fullName: 'tool2' },
      { fullName: 'tool3' }
    ]
    expect(groupByName(tools)).toEqual(tools)
  })

  it('splits parents', () => {
    const tools = [
      { fullName: 'a/tool1' },
      { fullName: 'tool2' },
      { fullName: 'b/c/tool3' }
    ]
    expect(groupByName(tools)).toEqual([
      { fullName: 'a', children: [tools[0]] },
      tools[1],
      { fullName: 'b', children: [{ fullName: 'b/c', children: [tools[2]] }] }
    ])
  })

  it('group parents', () => {
    const tools = [
      { fullName: 'a/tool1' },
      { fullName: 'tool2' },
      { fullName: 'a/c/tool3' }
    ]
    expect(groupByName(tools)).toEqual([
      {
        fullName: 'a',
        children: [tools[0], { fullName: 'a/c', children: [tools[2]] }]
      },
      tools[1]
    ])
  })

  it('can group without name', () => {
    const tools = [
      { fullName: 'a/tool1' },
      { fullName: 'a' },
      { fullName: 'a/c/tool3' },
      { fullName: 'b' },
      { fullName: 'b/tool2' }
    ]
    expect(groupByName(tools)).toEqual([
      {
        fullName: 'a',
        children: [
          tools[0],
          tools[1],
          { fullName: 'a/c', children: [tools[2]] }
        ]
      },
      { fullName: 'b', children: [tools[3], tools[4]] }
    ])
  })

  it('can group without name, different order', () => {
    const tools = [
      { fullName: 'a' },
      { fullName: 'a/tool1' },
      { fullName: 'a/c/tool3' },
      { fullName: 'b/tool2' },
      { fullName: 'b' }
    ]
    expect(groupByName(tools)).toEqual([
      {
        fullName: 'a',
        children: [
          tools[0],
          tools[1],
          { fullName: 'a/c', children: [tools[2]] }
        ]
      },
      { fullName: 'b', children: [tools[3], tools[4]] }
    ])
  })
})
