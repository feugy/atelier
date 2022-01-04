export function isFolder(tool) {
  return Array.isArray(tool?.children)
}

export function getName(fullName) {
  return fullName.split('/').pop()
}

export function getParentName(fullName = '') {
  return fullName.split('/').slice(0, -1).join('/')
}
