import { SET_USER, REMOVE_USER, SET_EVENTS, SET_EVENT, ADD_EVENT, SET_VOLUNTEERS, SET_SEARCH_EVENTS, SET_NOTIFICATIONS, SET_LATEST_VERSION } from "../constants/actionTypes";

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
      events.sort((c1, c2) => {
        if (c1.timestamp > c2.timestamp)
          return -1;
        if (c1.timestamp < c2.timestamp)
          return 1;
        return 0;
      });
      return Object.assign({}, state, {events});
    }
    case SET_VOLUNTEERS: {
      return Object.assign({}, state, {volunteers: action.volunteers});
    }
    case SET_SEARCH_EVENTS: {
      return Object.assign({}, state, {searchEvents: action.events});
    }
    case SET_NOTIFICATIONS: {
      const user = Object.assign({}, state.user, {notifications: action.notifications});
      return Object.assign({}, state, {user});
    }
    case SET_LATEST_VERSION: {
      return Object.assign({}, state, {latestVersion: action.version, newVersionExists:  state.version < action.version});
    }
  }
  return state;
}
