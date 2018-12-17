import {
  SET_USER,
  REMOVE_USER,
  SET_EVENTS,
  SET_EVENT,
  ADD_EVENT,
  SET_DISPATCHERS,
  SET_DISPATCHER,
  SET_VOLUNTEERS,
  SET_SEARCH_EVENTS,
  SET_CATEGORIES,
  SET_NOTIFICATIONS,
  SET_LATEST_VERSION,
  SET_ERROR
} from '../constants/actionTypes'
import { EventSource } from '../constants/consts'

export function dataSourceReducer(
  state = {
    dispatchers: {}
  },
  action
) {
  switch (action.type) {
    case SET_USER: {
      return Object.assign({}, state, {
        user: action.user,
        events: filterBotEvents(action.user, state.events)
      })
    }
    case REMOVE_USER: {
      return Object.assign({}, state, { user: {} })
    }
    case SET_EVENTS: {
      return Object.assign({}, state, {
        events: filterBotEvents(state.user, action.events)
      })
    }
    case SET_EVENT: {
      let events = []
      state.events.map(origEvent => {
        let event
        if (origEvent.key === action.event.key) {
          event = Object.assign({}, action.event)
        } else {
          event = Object.assign({}, origEvent)
        }
        events.push(event)
      })
      return Object.assign({}, state, {
        events: filterBotEvents(state.user, events)
      })
    }
    case ADD_EVENT: {
      let events = Object.assign([], state.events)
      events.push(action.event)
      events.sort((c1, c2) => {
        if (c1.timestamp > c2.timestamp) return -1
        if (c1.timestamp < c2.timestamp) return 1
        return 0
      })
      return Object.assign({}, state, {
        events: filterBotEvents(state.user, events)
      })
    }
    case SET_DISPATCHERS: {
      return Object.assign({}, state, { dispatchers: action.dispatchers })
    }
    case SET_DISPATCHER: {
      const dispatchers = Object.assign({}, state.dispatchers, {
        [action.dispatcher.id]: action.dispatcher
      })
      return Object.assign({}, state, { dispatchers })
    }
    case SET_VOLUNTEERS: {
      return Object.assign({}, state, { volunteers: action.volunteers })
    }
    case SET_CATEGORIES: {
      return Object.assign({}, state, { categories: action.categories })
    }
    case SET_SEARCH_EVENTS: {
      return Object.assign({}, state, { searchEvents: action.events })
    }
    case SET_NOTIFICATIONS: {
      const user = Object.assign({}, state.user, {
        notifications: action.notifications
      })
      return Object.assign({}, state, { user })
    }
    case SET_LATEST_VERSION: {
      return Object.assign({}, state, {
        latestVersion: action.version,
        newVersionExists: state.version < action.version
      })
    }
    case SET_ERROR: {
      if (!action.message) {
        return Object.assign({}, state, { error: undefined })
      } else {
        return Object.assign({}, state, {
          error: { message: action.message, err: action.err }
        })
      }
    }
  }
  return state
}

function filterBotEvents(user, events) {
  if (!events || !user || !user.id) {
    return events
  }
  return events.filter(
    event => event.source !== EventSource.FB_BOT || user.handleBot
  )
}
