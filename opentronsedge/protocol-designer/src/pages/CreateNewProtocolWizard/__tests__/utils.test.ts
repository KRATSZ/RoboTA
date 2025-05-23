import { it, describe, expect } from 'vitest'
import {
  FLEX_ROBOT_TYPE,
  ABSORBANCE_READER_V1,
  ABSORBANCE_READER_TYPE,
  HEATERSHAKER_MODULE_TYPE,
  HEATERSHAKER_MODULE_V1,
  MAGNETIC_BLOCK_TYPE,
  MAGNETIC_BLOCK_V1,
  MAGNETIC_MODULE_V1,
  MAGNETIC_MODULE_V2,
  TEMPERATURE_MODULE_TYPE,
  TEMPERATURE_MODULE_V1,
  TEMPERATURE_MODULE_V2,
  THERMOCYCLER_MODULE_TYPE,
  THERMOCYCLER_MODULE_V1,
  THERMOCYCLER_MODULE_V2,
} from '@opentrons/shared-data'
import { getNumSlotsAvailable, getTrashSlot } from '../utils'

import type { AdditionalEquipment, WizardFormState } from '../types'
import type { FormPipettesByMount } from '../../../step-forms'

let MOCK_FORM_STATE = {
  fields: {
    name: 'mockName',
    description: 'mockDescription',
    organizationOrAuthor: 'mockOrganizationOrAuthor',
    robotType: FLEX_ROBOT_TYPE,
  },
  pipettesByMount: {
    left: { pipetteName: 'mockPipetteName', tiprackDefURI: ['mocktip'] },
    right: { pipetteName: null, tiprackDefURI: null },
  } as FormPipettesByMount,
  modules: {},
  additionalEquipment: [],
} as WizardFormState

describe('getNumSlotsAvailable', () => {
  it('should return 0 for a gripper', () => {
    const result = getNumSlotsAvailable(null, [], 'gripper')
    expect(result).toBe(0)
  })

  it('should return 1 for a non MoaM module - temperature module', () => {
    const result = getNumSlotsAvailable(null, [], TEMPERATURE_MODULE_V1)
    expect(result).toBe(1)
  })

  it('should return 1 for a non MoaM module - absorbance plate reader', () => {
    const result = getNumSlotsAvailable(null, [], ABSORBANCE_READER_V1)
    expect(result).toBe(1)
  })

  it('should return 1 for a non MoaM module - thermocycler v1', () => {
    const result = getNumSlotsAvailable(null, [], THERMOCYCLER_MODULE_V1)
    expect(result).toBe(1)
  })

  it('should return 1 for a non MoaM module -  magnetic module v1', () => {
    const result = getNumSlotsAvailable(null, [], MAGNETIC_MODULE_V1)
    expect(result).toBe(1)
  })

  it('should return 1 for a non MoaM module - magnetic module v2', () => {
    const result = getNumSlotsAvailable(null, [], MAGNETIC_MODULE_V2)
    expect(result).toBe(1)
  })

  it('should return 2 for a thermocycler', () => {
    const result = getNumSlotsAvailable(null, [], THERMOCYCLER_MODULE_V2)
    expect(result).toBe(2)
  })

  it('should return 8 when there are no modules or additional equipment for a heater-shaker', () => {
    const result = getNumSlotsAvailable(null, [], HEATERSHAKER_MODULE_V1)
    expect(result).toBe(8)
  })

  it('should return 3 when there a plate reader', () => {
    const mockModules = {
      0: {
        model: ABSORBANCE_READER_V1,
        type: ABSORBANCE_READER_TYPE,
        slot: 'B3',
      },
    }
    const mockAdditionalEquipment: AdditionalEquipment[] = ['trashBin']
    const result = getNumSlotsAvailable(
      mockModules,
      mockAdditionalEquipment,
      'stagingArea'
    )
    // Note: the return value is 3 because trashBin can be placed slot1 and plate reader is on B3
    expect(result).toBe(3)
  })

  it('should return 0 when there is a TC and 7 modules for a temperature module v2', () => {
    const mockModules = {
      0: {
        model: HEATERSHAKER_MODULE_V1,
        type: HEATERSHAKER_MODULE_TYPE,
        slot: 'D1',
      },
      1: {
        model: TEMPERATURE_MODULE_V2,
        type: TEMPERATURE_MODULE_TYPE,
        slot: 'D3',
      },
      2: {
        model: TEMPERATURE_MODULE_V2,
        type: TEMPERATURE_MODULE_TYPE,
        slot: 'C1',
      },
      3: {
        model: TEMPERATURE_MODULE_V2,
        type: TEMPERATURE_MODULE_TYPE,
        slot: 'B3',
      },
      4: {
        model: THERMOCYCLER_MODULE_V2,
        type: THERMOCYCLER_MODULE_TYPE,
        slot: 'B1',
      },
      5: {
        model: TEMPERATURE_MODULE_V2,
        type: TEMPERATURE_MODULE_TYPE,

        slot: 'A3',
      },
      6: {
        model: TEMPERATURE_MODULE_V2,
        type: TEMPERATURE_MODULE_TYPE,
        slot: 'C3',
      },
    } as any
    const result = getNumSlotsAvailable(mockModules, [], TEMPERATURE_MODULE_V2)
    expect(result).toBe(0)
  })

  it('should return 1 when there are 9 additional equipment and 1 is a waste chute on the staging area and one is a gripper for a heater-shaker', () => {
    const mockAdditionalEquipment: AdditionalEquipment[] = [
      'trashBin',
      'stagingArea',
      'stagingArea',
      'stagingArea',
      'stagingArea',
      'wasteChute',
      'trashBin',
      'gripper',
      'trashBin',
    ]
    const result = getNumSlotsAvailable(
      null,
      mockAdditionalEquipment,
      HEATERSHAKER_MODULE_V1
    )
    expect(result).toBe(1)
  })

  it('should return 1 when there is a full deck but one staging area for waste chute', () => {
    const mockModules = {
      0: {
        model: HEATERSHAKER_MODULE_V1,
        type: HEATERSHAKER_MODULE_TYPE,
        slot: 'D1',
      },
      1: {
        model: TEMPERATURE_MODULE_V2,
        type: TEMPERATURE_MODULE_TYPE,
        slot: 'D3',
      },
      2: {
        model: TEMPERATURE_MODULE_V2,
        type: TEMPERATURE_MODULE_TYPE,
        slot: 'C1',
      },
      3: {
        model: TEMPERATURE_MODULE_V2,
        type: TEMPERATURE_MODULE_TYPE,
        slot: 'B3',
      },
      4: {
        model: THERMOCYCLER_MODULE_V2,
        type: THERMOCYCLER_MODULE_TYPE,
        slot: 'B1',
      },
    } as any
    const mockAdditionalEquipment: AdditionalEquipment[] = [
      'trashBin',
      'stagingArea',
    ]
    const result = getNumSlotsAvailable(
      mockModules,
      mockAdditionalEquipment,
      'wasteChute'
    )
    expect(result).toBe(1)
  })

  it('should return 1 when there are 7 modules (with one magnetic block) and one trash for staging area', () => {
    const mockModules = {
      0: {
        model: HEATERSHAKER_MODULE_V1,
        type: HEATERSHAKER_MODULE_TYPE,
        slot: 'D1',
      },
      1: {
        model: TEMPERATURE_MODULE_V2,
        type: TEMPERATURE_MODULE_TYPE,
        slot: 'D3',
      },
      2: {
        model: TEMPERATURE_MODULE_V2,
        type: TEMPERATURE_MODULE_TYPE,
        slot: 'C1',
      },
      3: {
        model: TEMPERATURE_MODULE_V2,
        type: TEMPERATURE_MODULE_TYPE,
        slot: 'B3',
      },
      4: {
        model: THERMOCYCLER_MODULE_V2,
        type: THERMOCYCLER_MODULE_TYPE,
        slot: 'B1',
      },
      5: {
        model: MAGNETIC_BLOCK_V1,
        type: MAGNETIC_BLOCK_TYPE,
        slot: 'C2',
      },
    } as any
    const mockAdditionalEquipment: AdditionalEquipment[] = ['trashBin']
    const result = getNumSlotsAvailable(
      mockModules,
      mockAdditionalEquipment,
      'stagingArea'
    )

    expect(result).toBe(1)
  })

  it('should return 1 when there are 8 modules with 2 magnetic blocks and one trash for staging area', () => {
    const mockModules = {
      0: {
        model: HEATERSHAKER_MODULE_V1,
        type: HEATERSHAKER_MODULE_TYPE,
        slot: 'D1',
      },
      1: {
        model: TEMPERATURE_MODULE_V2,
        type: TEMPERATURE_MODULE_TYPE,
        slot: 'D3',
      },
      2: {
        model: TEMPERATURE_MODULE_V2,
        type: TEMPERATURE_MODULE_TYPE,
        slot: 'C1',
      },
      3: {
        model: TEMPERATURE_MODULE_V2,
        type: TEMPERATURE_MODULE_TYPE,
        slot: 'B3',
      },
      4: {
        model: THERMOCYCLER_MODULE_V2,
        type: THERMOCYCLER_MODULE_TYPE,
        slot: 'B1',
      },
      5: {
        model: MAGNETIC_BLOCK_V1,
        type: MAGNETIC_BLOCK_TYPE,
        slot: 'C2',
      },
      6: {
        model: MAGNETIC_BLOCK_V1,
        type: MAGNETIC_BLOCK_TYPE,
        slot: 'D2',
      },
    } as any
    const mockAdditionalEquipment: AdditionalEquipment[] = ['trashBin']
    const result = getNumSlotsAvailable(
      mockModules,
      mockAdditionalEquipment,
      'stagingArea'
    )
    expect(result).toBe(1)
  })
  it('should return 0 when there are 11 magnetic blocks for staging area', () => {
    const mockModules = {
      0: {
        model: MAGNETIC_BLOCK_V1,
        type: MAGNETIC_BLOCK_TYPE,
        slot: 'D2',
      },
      1: {
        model: MAGNETIC_BLOCK_V1,
        type: MAGNETIC_BLOCK_TYPE,
        slot: 'C2',
      },
      2: {
        model: MAGNETIC_BLOCK_V1,
        type: MAGNETIC_BLOCK_TYPE,
        slot: 'B2',
      },
      3: {
        model: MAGNETIC_BLOCK_V1,
        type: MAGNETIC_BLOCK_TYPE,
        slot: 'A2',
      },
      4: {
        model: MAGNETIC_BLOCK_V1,
        type: MAGNETIC_BLOCK_TYPE,
        slot: 'D3',
      },
      5: {
        model: MAGNETIC_BLOCK_V1,
        type: MAGNETIC_BLOCK_TYPE,
        slot: 'C3',
      },
      6: {
        model: MAGNETIC_BLOCK_V1,
        type: MAGNETIC_BLOCK_TYPE,
        slot: 'B3',
      },
      7: {
        model: MAGNETIC_BLOCK_V1,
        type: MAGNETIC_BLOCK_TYPE,
        slot: 'D1',
      },
      8: {
        model: MAGNETIC_BLOCK_V1,
        type: MAGNETIC_BLOCK_TYPE,
        slot: 'C1',
      },
      9: {
        model: MAGNETIC_BLOCK_V1,
        type: MAGNETIC_BLOCK_TYPE,
        slot: 'B1',
      },
      10: {
        model: MAGNETIC_BLOCK_V1,
        type: MAGNETIC_BLOCK_TYPE,
        slot: 'A1',
      },
    } as any
    const mockAdditionalEquipment: AdditionalEquipment[] = []
    const result = getNumSlotsAvailable(
      mockModules,
      mockAdditionalEquipment,
      'stagingArea'
    )
    // Note: the return value is 0 because trashBin A3
    expect(result).toBe(0)
  })

  it('should return 3 when slots in column 1 are occupied', () => {
    const mockModules = {
      0: {
        model: TEMPERATURE_MODULE_V2,
        type: TEMPERATURE_MODULE_TYPE,
        slot: 'D1',
      },
      1: {
        model: HEATERSHAKER_MODULE_V1,
        type: HEATERSHAKER_MODULE_TYPE,
        slot: 'C1',
      },
      2: {
        model: THERMOCYCLER_MODULE_V2,
        type: THERMOCYCLER_MODULE_TYPE,
        slot: 'B1',
      },
    } as any
    const mockAdditionalEquipment: AdditionalEquipment[] = ['trashBin']
    const result = getNumSlotsAvailable(
      mockModules,
      mockAdditionalEquipment,
      'stagingArea'
    )

    expect(result).toBe(3)
  })

  it('should return 11 when there are 4 staging area for magnetic block', () => {
    const mockAdditionalEquipment: AdditionalEquipment[] = [
      'stagingArea',
      'stagingArea',
      'stagingArea',
      'stagingArea',
    ]
    const result = getNumSlotsAvailable(
      [],
      mockAdditionalEquipment,
      MAGNETIC_BLOCK_V1
    )
    expect(result).toBe(11)
  })
  it('should return 8 when there are 4 modules, 4 staging area for magnetic block since magnetic blocks can now go on staging areas', () => {
    const mockModules = {
      0: {
        model: HEATERSHAKER_MODULE_V1,
        type: HEATERSHAKER_MODULE_TYPE,
        slot: 'D1',
      },
      1: {
        model: TEMPERATURE_MODULE_V2,
        type: TEMPERATURE_MODULE_TYPE,
        slot: 'D3',
      },
      2: {
        model: THERMOCYCLER_MODULE_V2,
        type: THERMOCYCLER_MODULE_TYPE,
        slot: 'B1',
      },
    } as any
    const mockAdditionalEquipment: AdditionalEquipment[] = [
      'stagingArea',
      'stagingArea',
      'stagingArea',
      'stagingArea',
    ]
    const result = getNumSlotsAvailable(
      mockModules,
      mockAdditionalEquipment,
      MAGNETIC_BLOCK_V1
    )
    expect(result).toBe(6)
  })
})

describe('getTrashSlot', () => {
  it('should return the default slot A3 when there is no staging area or module in that slot', () => {
    MOCK_FORM_STATE = {
      ...MOCK_FORM_STATE,
      additionalEquipment: ['trashBin'],
    }
    const result = getTrashSlot(MOCK_FORM_STATE)
    expect(result).toBe('cutoutA3')
  })
  it('should return cutoutA3 when there are 3 or fewer staging areas', () => {
    MOCK_FORM_STATE = {
      ...MOCK_FORM_STATE,
      additionalEquipment: ['stagingArea'],
    }
    const result = getTrashSlot(MOCK_FORM_STATE)
    expect(result).toBe('cutoutA3')
  })
  it('should return cutoutA1 when there are 4 staging areas', () => {
    MOCK_FORM_STATE = {
      ...MOCK_FORM_STATE,
      additionalEquipment: [
        'stagingArea',
        'stagingArea',
        'stagingArea',
        'stagingArea',
      ],
    }
    const result = getTrashSlot(MOCK_FORM_STATE)
    expect(result).toBe('cutoutA1')
  })
})
