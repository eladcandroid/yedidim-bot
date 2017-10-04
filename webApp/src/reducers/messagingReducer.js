import { SET_MESSAGING_PERMISSION, SET_MESSAGING_TOKEN } from "../constants/actionTypes";

export function messagingReducer(state = {}, action) {
  switch (action.type) {
    case SET_MESSAGING_PERMISSION: {
      return Object.assign({}, state, {permissionSet: true, permission: action.permission});
    }
    case SET_MESSAGING_TOKEN: {
      return Object.assign({}, state, {token: action.token});
    }
  }
  return state;
}
