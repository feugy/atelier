const unnamed = 'no-name'

function addToLevel(tool, level, legs) {
  const leg = legs.shift()
  let items = level.get(leg)
  if (legs.length === 0) {
    if (items) {
      // user mixed named & unnamed tools for this level
      items.set(unnamed, tool)
    } else {
      level.set(leg, tool)
    }
  } else {
    if (!items) {
      items = new Map()
      level.set(leg, items)
    } else if (!(items instanceof Map)) {
      // user mixed named & unnamed tools for this level
      items = new Map([[unnamed, items]])
      level.set(leg, items)
    }
    addToLevel(tool, items, legs)
  }
}

export function groupByName(tools = []) {
  const level = new Map()
  for (const tool of tools) {
    const legs = tool.fullName.split('/')
    addToLevel(tool, level, legs)
  }
  return level
}
