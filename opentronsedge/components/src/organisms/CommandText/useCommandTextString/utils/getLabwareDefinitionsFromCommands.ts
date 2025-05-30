import { getLabwareDefURI } from '@opentrons/shared-data'

import type { LabwareDefinition2, RunTimeCommand } from '@opentrons/shared-data'

// Note: This is an O(n) operation.
export function getLabwareDefinitionsFromCommands(
  commands: RunTimeCommand[]
): LabwareDefinition2[] {
  return commands.reduce<LabwareDefinition2[]>((acc, command) => {
    const isLoadingNewDef =
      (command.commandType === 'loadLabware' ||
        command.commandType === 'loadLid') &&
      !acc.some(
        def =>
          command.result?.definition != null &&
          getLabwareDefURI(def) === getLabwareDefURI(command.result?.definition)
      )
    return isLoadingNewDef && command.result?.definition != null
      ? [...acc, command.result?.definition]
      : acc
  }, [])
}
