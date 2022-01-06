function addToLevel(tool, level, legs, legRank = 1) {
  const fullName = legs.slice(0, legRank).join('/')
  const index = level.findIndex(child => fullName === child.fullName)
  if (legRank > legs.length - 1) {
    if (index < 0) {
      level.push(tool)
    } else {
      // user mixed named & unnamed tools for this level
      level[index].children.push(tool)
    }
  } else {
    let child = { fullName, children: [] }
    if (index < 0) {
      level.push(child)
    } else {
      child = level[index]
      if (!Array.isArray(child.children)) {
        // user mixed named & unnamed tools for this level
        child = { fullName, children: [child] }
        level[index] = child
      }
    }
    addToLevel(tool, child.children, legs, legRank + 1)
  }
}

export function groupByName(tools = []) {
  const level = []
  for (const tool of tools) {
    const legs = tool.fullName.split('/')
    addToLevel(tool, level, legs)
  }
  return level
}
