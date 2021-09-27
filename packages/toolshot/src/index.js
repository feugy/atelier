import { render } from '@testing-library/svelte'
import 'jest-specific-snapshot'
import klaw from 'klaw-sync'
import { basename, dirname, extname, relative } from 'path'
import html from 'svelte-htm'

/**
 * @typedef {object} ToolshotOptions - toolshot options, including:
 * @param {string} [suite='Toolshot'] - Jest suite name used.
 * @param {string} [folder='.'] - base folder containing tool files.
 * @param {string} [include='\.tools\.svelte$'] - regular expression tested against file name to detect tool files.
 * @param {string} [snapshotFolder='__snapshots__'] - folder name used to contain generated snapshots.
 */

/**
 * Creates a Jest test suite to render Atelier tools/toolboxes, and compare them with snapshots.
 * You can provide sensible options to indicates where your tools/toolboxes are.
 * The test suite will contain a test per tool/toolbox file, and will generate a snapshot for file for each of them (in a __snapshots__ folder).
 * If your tool/toolbox file contain several tools, each will have their own entry in the snapshot file.
 * @param {ToolshotOptions} options - toolshot options
 */
export function configureToolshot({
  suite = 'Toolshot',
  folder = '.',
  include = '\\.tools\\.svelte$',
  snapshotFolder = '__snapshots__'
} = {}) {
  if (typeof describe !== 'function' || typeof test !== 'function') {
    throw new Error('configureToolshot() must run within Jest context')
  }

  const includeRegExp = new RegExp(include, 'i')
  // Jest needs describe() and tests() to be called synchronously, so we must find tool files synchronously as well
  const toolboxes = klaw(folder, {
    nodir: true,
    filter({ path, stats }) {
      return stats.isDirectory() || includeRegExp.test(path)
    }
  })

  describe(suite, () => {
    for (const toolbox of toolboxes) {
      const toolboxPath = relative(folder, toolbox.path)
      const toolboxFolder = dirname(toolbox.path)
      const toolboxName = basename(toolbox.path, extname(toolbox.path))

      test(toolboxPath, async () => {
        const registered = []

        function handleMessage({ data }) {
          if (data.type === 'registerTool') {
            registered.push(data.data)
          }
        }

        window.addEventListener('message', handleMessage)

        const { default: Toolbox } = await import(
          /* @vite-ignore */ toolbox.path
        )
        render(html`<${Toolbox} />`)

        // since postmessage is asynchronous, we must wait before knowing registered tools
        await new Promise(resolve => setTimeout(resolve, 0))
        window.removeEventListener('message', handleMessage)

        for (const tool of registered) {
          // select tools one by one...
          window.postMessage({ type: 'selectTool', data: tool }, '*')
          await new Promise(resolve => setTimeout(resolve, 0))

          // ...and assert their rendering
          expect(
            document.querySelector(`[data-tool-name="${tool.name}"]`).firstChild
          ).toMatchSpecificSnapshot(
            `${toolboxFolder}/${snapshotFolder}/${toolboxName}.shot`
          )
        }
      })
    }
  })
}
