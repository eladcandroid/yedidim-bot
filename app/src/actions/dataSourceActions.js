import * as firebase from 'firebase';
import * as firebaseui from 'firebaseui';
import { SET_USER, REMOVE_USER, SET_CALLS, SET_CALL } from '../constants/actionTypes';

import { objectToArray } from '../common/utils';

const firebaseConfig = {
  apiKey: "AIzaSyDp5-02CpUQ5gyquZt2ZHSfnRjCKY5lZis",
  authDomain: "yedidim-sandbox.firebaseapp.com",
  databaseURL: "https://yedidim-sandbox.firebaseio.com",
  projectId: "yedidim-sandbox",
  storageBucket: "yedidim-sandbox.appspot.com",
  messagingSenderId: "918819260524"
};

const firebaseUIConfig = {
  'callbacks': {
    'signInSuccess': function(user) {
      handleSignedInUser(user);
      // Do not redirect.
      return false;
    }
  },
  'signInFlow': 'popup',
  'signInOptions': [
    {
      provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    },
    // {
    //   provider: firebase.auth.EmailAuthProvider.PROVIDER_ID
    // },
  ],
  'tosUrl': 'https://www.google.com'
};

const firebaseApp = firebase.initializeApp(firebaseConfig);
const firebaseuiAuth = new firebaseui.auth.AuthUI(firebaseApp.auth());

export function checkUserAuth() {
  return (dispatch => {
    firebaseApp.auth().onAuthStateChanged(function(user) {
      if (user){
        dispatch(handleSignedInUser({email: user.email}));
      }
      else {
        dispatch(handleSignedOutUser());
      }
    });
  });
}

export function addCall(call) {
  return (dispatch => {
    call.key = firebase.database().ref().child('calls').push().key;
    firebase.database().ref('calls/' + call.key).set(call, (err) => {
      if (err) {
        // dispatch(setError({title:"Failed to update!", message: err}));
      } else {
        dispatch(setCall(call));
      }
    });

  });
}

function handleSignedInUser(user) {
  // setConnectionTime(user);
  return (dispatch => {
    dispatch(setUser(user));
    dispatch(loadCalls());
  });
}

function handleSignedOutUser() {
  return (dispatch => {
    dispatch(removeUser());
    firebaseuiAuth.reset();
    firebaseuiAuth.start('#firebaseui-auth-container', firebaseUIConfig);
  });
}

// function setConnectionTime(user) {
//   const connectedRef = firebase.database().ref('.info/connected');
//   connectedRef.on('value', function(snap) {
//     if (snap.val() === true) {
//       const userKey = user.email.split('.', 1);
//       const lastOnlineRef = firebase.database().ref(`/users/${userKey}`);
//       lastOnlineRef.onDisconnect().update({lastOnline: firebase.database.ServerValue.TIMESTAMP, lastOnlineDate: new Date()});
//     }
//   });
// }

function loadCalls() {
  return (dispatch => {
    firebaseApp.database().ref('/calls').once('value').then((snapshot) => {
      let calls = objectToArray(snapshot.val());
      calls.sort((c1, c2) => {
        if (c1.timestamp > c2.timestamp)
          return -1;
        if (c1.timestamp < c2.timestamp)
          return 1;
        return 0;
      });
      dispatch(setCalls(calls));
    });
    firebaseApp.database().ref('/calls').on('child_changed', (data) => {
      let call = data.val();
      call.key = data.key;
      dispatch(setCall(call));
    });
  });
}

function setUser(user){
  return {
    type: SET_USER,
    user,
  };
}

function removeUser(){
  return {
    type: REMOVE_USER
  };
}

function setCalls(calls){
  return {
    type: SET_CALLS,
    calls,
  };
}

function setCall(call){
  return {
    type: SET_CALL,
    call,
  };
}