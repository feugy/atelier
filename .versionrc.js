function isMelodieDep(name) {
  return name?.startsWith('@atelier-wb') || name?.startsWith('atelier')
}

function updateDeps(package, version) {
  if (isMelodieDep(package.name)) {
    package.version = version
  }
  for (const deps of [
    'dependencies',
    'optionalDependencies',
    'devDependencies',
    'packages',
    'requires'
  ].filter(name => typeof package[name] === 'object')) {
    for (const dep in package[deps]) {
      if (deps === 'packages' || isMelodieDep(dep)) {
        if (typeof package[deps][dep] === 'object') {
          updateDeps(package[deps][dep], version)
        } else {
          package[deps][dep] = version
        }
      }
    }
  }
  return package
}

const updater = {
  readVersion(contents) {
    return JSON.parse(contents).version
  },
  writeVersion(contents, version) {
    return JSON.stringify(updateDeps(JSON.parse(contents), version))
  }
}

module.exports = {
  bumpFiles: [
    { filename: 'package.json', updater },
    { filename: 'package-lock.json', updater },
    { filename: 'packages/vite-plugin-atelier/package.json', updater },
    { filename: 'packages/svelte/package.json', updater },
    { filename: 'packages/toolshot/package.json', updater },
    { filename: 'packages/ui/package.json', updater }
  ]
}
