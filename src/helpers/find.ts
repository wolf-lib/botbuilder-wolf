import { Slot, Ability } from '../types'

export const findSlotByEntityName = 
  (entityName: string, slots: Slot[]) => slots.find((slot) => slot.name === entityName)
export const findAbilityByName = 
  (abilityName: string, abilities: Ability[]) => abilities.find(ability => ability.name === abilityName)
