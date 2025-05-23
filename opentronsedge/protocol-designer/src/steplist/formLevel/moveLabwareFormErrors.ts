import { getLabwareDefIsStandard } from '@opentrons/shared-data'
import {
  COMPATIBLE_LABWARE_ALLOWLIST_FOR_ADAPTER,
  getLabwareCompatibleWithModule,
} from '../../utils/labwareModuleCompatibility'
import type { LabwareLocation } from '@opentrons/shared-data'
import type {
  InvariantContext,
  LabwareEntity,
} from '@opentrons/step-generation'
import type { ProfileFormError } from './profileErrors'

type HydratedFormData = any

const getMoveLabwareError = (
  labware: LabwareEntity,
  newLocation: LabwareLocation,
  invariantContext: InvariantContext
): string | null => {
  let errorString: string | null = null
  if (
    labware == null ||
    newLocation == null ||
    newLocation === 'offDeck' ||
    newLocation === 'systemLocation' ||
    !getLabwareDefIsStandard(labware?.def)
  )
    return null
  const selectedLabwareDefUri = labware?.labwareDefURI
  if ('moduleId' in newLocation) {
    const moduleType =
      invariantContext.moduleEntities[newLocation.moduleId].type
    errorString = !getLabwareCompatibleWithModule(labware.def, moduleType)
      ? 'Labware incompatible with this module'
      : null
  } else if ('labwareId' in newLocation) {
    const adapterValueDefUri =
      invariantContext.labwareEntities[newLocation.labwareId].def.parameters
        .loadName
    const adapterAllowList =
      COMPATIBLE_LABWARE_ALLOWLIST_FOR_ADAPTER[adapterValueDefUri]
    errorString = !adapterAllowList?.includes(selectedLabwareDefUri)
      ? 'Labware incompatible with this adapter'
      : null
  }
  return errorString
}

export const getMoveLabwareFormErrors = (
  hydratedForm: HydratedFormData,
  invariantContext: InvariantContext
): ProfileFormError[] => {
  if (hydratedForm.stepType !== 'moveLabware') {
    return []
  }

  const labware = hydratedForm.labware as LabwareEntity
  const newLocation = hydratedForm.newLocation as LabwareLocation

  const errorString = getMoveLabwareError(
    labware,
    newLocation,
    invariantContext
  )

  return errorString != null
    ? ([
        {
          title: errorString,
          dependentProfileFields: ['newLocation'],
        },
      ] as ProfileFormError[])
    : []
}
