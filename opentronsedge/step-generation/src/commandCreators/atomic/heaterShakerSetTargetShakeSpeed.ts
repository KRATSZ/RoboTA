import assert from 'assert'
import { HEATERSHAKER_MODULE_TYPE } from '@opentrons/shared-data'
import { uuid } from '../../utils'
import * as errorCreators from '../../errorCreators'
import type { HeaterShakerSetAndWaitForShakeSpeedCreateCommand } from '@opentrons/shared-data'
import type { CommandCreator } from '../../types'
export const heaterShakerSetTargetShakeSpeed: CommandCreator<
  HeaterShakerSetAndWaitForShakeSpeedCreateCommand['params']
> = (args, invariantContext, prevRobotState) => {
  const { moduleId, rpm } = args

  if (moduleId === null) {
    return {
      errors: [errorCreators.missingModuleError()],
    }
  }

  assert(
    invariantContext.moduleEntities[moduleId]?.type ===
      HEATERSHAKER_MODULE_TYPE,
    `expected module ${moduleId} to be heaterShaker, got ${invariantContext.moduleEntities[moduleId]?.type}`
  )

  return {
    commands: [
      {
        commandType: 'heaterShaker/setAndWaitForShakeSpeed',
        key: uuid(),
        params: {
          moduleId,
          rpm,
        },
      },
    ],
  }
}
