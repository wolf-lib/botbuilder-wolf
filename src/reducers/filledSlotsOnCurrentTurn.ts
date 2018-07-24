import { Reducer } from 'redux'
import { SlotId } from '../types'
import { START_FILL_SLOT_STAGE, FILL_SLOT } from '../actions'

const reducer: Reducer = (prev: SlotId[] = [], action) => {
  if (action.type === START_FILL_SLOT_STAGE) {
    return []
  }

  if (action.type === FILL_SLOT) {
    const {slotName, abilityName} = action.payload
    return [
      ...prev,
      { slotName, abilityName }
    ]
  }

  return prev
}

export default reducer