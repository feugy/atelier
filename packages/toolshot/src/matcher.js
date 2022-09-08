import path from 'path'
import { SnapshotState, toMatchSnapshot } from 'jest-snapshot'

const snapshotsStateMap = new Map()
let commonSnapshotState

afterAll(() => {
  for (const snapshotState of snapshotsStateMap.values()) {
    const uncheckedCount = snapshotState.getUncheckedCount()

    if (uncheckedCount) {
      snapshotState.removeUncheckedKeys()
    }

    snapshotState.save()

    if (commonSnapshotState) {
      // Update common state so we get the report right with added/update/unmatched snapshots.
      // Jest will display the "u" & "i" suggestion, plus displaying the right number of update/added/unmatched snapshots.
      for (const key of ['unmatched', 'matched', 'updated', 'added']) {
        commonSnapshotState[key] += snapshotState[key]
      }
    }
  }
})

expect.extend({
  toMatchFileSnapshot: function toMatchFileSnapshot(
    received,
    snapshotFile,
    hint
  ) {
    const absoluteSnapshotFile = getAbsolutePathToSnapshot(
      this.testPath,
      snapshotFile
    )

    // store the common state to re-use it in "afterAll" hook.
    commonSnapshotState = this.snapshotState

    if (!snapshotsStateMap.has(absoluteSnapshotFile)) {
      snapshotsStateMap.set(
        absoluteSnapshotFile,
        new SnapshotState(absoluteSnapshotFile, {
          updateSnapshot: commonSnapshotState._updateSnapshot,
          snapshotPath: absoluteSnapshotFile
        })
      )
    }
    const newThis = {
      ...this,
      currentTestName: hint,
      snapshotState: snapshotsStateMap.get(absoluteSnapshotFile)
    }
    const patchedToMatchSnapshot = toMatchSnapshot.bind(newThis)

    return patchedToMatchSnapshot(received)
  }
})

function getAbsolutePathToSnapshot(testPath, snapshotFile) {
  return path.isAbsolute(snapshotFile)
    ? snapshotFile
    : path.resolve(path.dirname(testPath), snapshotFile)
}
