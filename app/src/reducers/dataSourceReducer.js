import { SET_USER, REMOVE_USER, SET_EVENTS, SET_EVENT, ADD_EVENT } from "../constants/actionTypes";

export function dataSourceReducer(state = {}, action) {
  switch (action.type) {
    case SET_USER: {
      return Object.assign({}, state, {user: action.user});
    }
    case REMOVE_USER: {
      return Object.assign({}, state, {user: {}});
    }
    case SET_EVENTS: {
      return Object.assign({}, state, {events: action.events});
    }
    case SET_EVENT: {
      let events = [];
      state.events.map(origEvent => {
        let event;
        if (origEvent.key === action.event.key){
          event = Object.assign({}, action.event);
        } else {
          event = Object.assign({}, origEvent);
        }
        events.push(event);
      });
      return Object.assign({}, state, {events});
    }
    case ADD_EVENT: {
      let events = Object.assign([], state.events);
      events.push(action.event);
      return Object.assign({}, state, {events});
    }
  }
  return state;
}
