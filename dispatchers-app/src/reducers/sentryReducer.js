import { SET_USER } from "../constants/actionTypes";
import Sentry from 'sentry-expo';

export function sentryReducer(state = {}, action) {
  switch (action.type) {
    case SET_USER: {
      Sentry.setUserContext(action.user);
      return state
    }
  }
  return state;
}
