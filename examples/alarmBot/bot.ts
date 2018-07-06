import { BotFrameworkAdapter, MemoryStorage, ConversationState } from 'botbuilder'
// import { BotFrameworkAdapter } from 'botbuilder-services'
import nlp from './nlp'

// import * as wolf from '../../src'
import intake, { NlpResult, Entity } from '../../src/stages/intake'
import { validateSlots, fillSlots, ValidateSlotsResult, FillSlotsResult } from '../../src/stages/fillSlot'
import evaluate, { EvaluateResult } from '../../src/stages/evaluate'
import action, { ActionResult } from '../../src/stages/actions'
import outtake from '../../src/stages/outtake'

// import Wolf middleware
import initializeWolfState from '../../src/middlewares/initializeWolfState'

import { Ability, AbilityFunctionMap } from '../../src/types'
// import difference from 'lodash.difference'

import * as addAlarm from './addAlarm'
import * as removeAlarm from './removeAlarm'
import * as listAlarms from './listAlarms'
import * as listAbilities from './listAbilities'

const ksl: AbilityFunctionMap = {
  addAlarm,
  removeAlarm,
  listAlarms,
  listAbilities
}

import abilityList from './abilities'

const restify = require('restify')

// Create server
let server = restify.createServer()
server.listen(process.env.port || 3978, () => {
  console.log(`${server.name} listening to ${server.url}`)
})

// Create connector
const adapter = new BotFrameworkAdapter({
  appId: process.env.MICROSOFT_APP_ID,
  appPassword: process.env.MICROSOFT_APP_PASSWORD
})

const conversationState = new ConversationState(new MemoryStorage())

adapter.use(conversationState)
// Wolf middleware
adapter.use(initializeWolfState(conversationState))

// for wolf..
const abilities: Ability[] = abilityList

server.post('/api/messages', (req, res) => {
  adapter.processActivity(req, res, (context) => {
    try {
      if (context.activity.type !== 'message') {
        return
      }

      const message = context.activity.text
      
      const state = conversationState.get(context)
      const pendingWolfState = state.wolf
      
      let nlpResult: NlpResult
      if (pendingWolfState.waitingFor.slotName) { // bot asked for a question
        nlpResult = {
          intent: pendingWolfState.activeAbility,
          entities: [
            {
              entity: pendingWolfState.waitingFor.slotName,
              value: message,
              string: message
            }
          ]
        }
        // return intakeResult
      } else {
        nlpResult = nlp(message)
      }

      // Intake
      const intakeResult = intake(state.wolf, nlpResult, 'listAbilities')

      // FillSlot
      const validatedResults: ValidateSlotsResult = validateSlots(abilities, intakeResult)
      const fillSlotResult: FillSlotsResult = fillSlots(abilities, validatedResults)

      // Evaluate
      const evaluateResult: EvaluateResult = evaluate(abilities, ksl, fillSlotResult)
      
      // Action
      const actionResult: ActionResult = action(abilities, ksl, state, evaluateResult)

      // Outtake
      outtake(state, context.sendActivity.bind(context), actionResult)

    } catch (err) {
      console.error(err.stack)
    }
  })
})
