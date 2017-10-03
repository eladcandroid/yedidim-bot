import { SET_USER, REMOVE_USER, SET_CALLS, SET_CALL, ADD_CALL} from "../constants/actionTypes";

export function dataSourceReducer(state = {}, action) {
  switch (action.type) {
    case SET_USER: {
      let user = action.user;
      user.id = user.email.split('@')[0];
      return Object.assign({}, state, {user: action.user});
    }
    case REMOVE_USER: {
      return Object.assign({}, state, {user: undefined});
    }
    case SET_CALLS: {
      return Object.assign({}, state, {calls: action.calls});
    }
    case SET_CALL: {
      let calls = [];
      state.calls.map(origCall => {
        let call;
        if (origCall.key === action.call.key){
          call = Object.assign({}, action.call);
        } else {
          call = Object.assign({}, origCall);
        }
        calls.push(call);
      });
      return Object.assign({}, state, {calls});
    }
    case ADD_CALL: {
      let calls = Object.assign([], state.calls);
      calls.push(action.call);
      return Object.assign({}, state, {calls});
    }
  }
  return state;
}
