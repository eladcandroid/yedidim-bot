import * as firebase from 'firebase';
import { SET_USER, REMOVE_USER, SET_EVENTS, SET_EVENT, ADD_EVENT, SET_ERROR } from '../constants/actionTypes';
import { registerForPushNotifications } from "./notificationsActions";
import { objectToArray } from "../common/utils";

const firebaseConfig = {
  sandbox: {
    apiKey: "AIzaSyDp5-02CpUQ5gyquZt2ZHSfnRjCKY5lZis",
    authDomain: "yedidim-sandbox.firebaseapp.com",
    databaseURL: "https://yedidim-sandbox.firebaseio.com",
    projectId: "yedidim-sandbox",
    storageBucket: "yedidim-sandbox.appspot.com",
    messagingSenderId: "918819260524"
  },
  sandbox2: {
    apiKey: "AIzaSyAwKEsWodtnrprOhYXA5tFb9zbUnLqOBk4",
    authDomain: "yedidim-sandbox-2.firebaseapp.com",
    databaseURL: "https://yedidim-sandbox-2.firebaseio.com",
    projectId: "yedidim-sandbox-2",
    storageBucket: "yedidim-sandbox-2.appspot.com",
    messagingSenderId: "1011917548573"
  }
};

firebase.initializeApp(firebaseConfig.sandbox);

export function checkUserAuth() {
  return (dispatch => {
    firebase.auth().onAuthStateChanged(user => {
      if (user && user.providerData[0].providerId === 'password') {
        user.id = user.email.split('@')[0];
        dispatch(handleSignedInUser({id: user.id, uid: user.uid, email: user.email}));
      }
      else {
        dispatch(handleSignedOutUser());
      }
    });
  });
}

export function signIn(id, phone) {
  return (dispatch => {
    const email = id + '@yedidim.org';
    firebase.auth().signInWithEmailAndPassword(email, phone)
      .catch(function (err) {
        dispatch(setError(err));
      });
  });
}

export function storeNotificationToken(token) {
  return ((dispatch, getState) => {
    const user = getState().dataSource.user;
    if (!user || !user.id){
      return;
    }
    firebase.database().ref('dispatchers/' + getState().dataSource.user.id).update({
      token,
      notification: (typeof token !== 'undefined')
    }, (err) => {
      if (err) {
        dispatch(setError('Unable to set token. ', err));
      } else {
        console.log('Token was set', token);
      }
    });
  });
}

export function signOutUser() {
  return (dispatch => {
    firebase.auth().signOut().then(() => {
      dispatch(handleSignedOutUser());
    });
  });
}

export function updateEventStatus(event, status) {
  const updatedEvent = Object.assign({}, event, {status});
  return (dispatch => {
    firebase.database().ref('calls/' + event.key).set(updatedEvent, (err) => {
      if (err) {
        dispatch(setError('Failed to update!', err));
      } else {
        dispatch(setEvent(updatedEvent));
      }
    });
  });
}

function handleSignedInUser(user) {
  return (dispatch => {
    dispatch(setUser(user));
    dispatch(loadUserData(user));
    dispatch(registerForPushNotifications());
    dispatch(loadEvents());
  });
}

function handleSignedOutUser() {
  return (dispatch => {
    dispatch(storeNotificationToken());
    dispatch(removeUser());
  });
}

function loadUserData(user) {
  return (dispatch => {
    firebase.database().ref('/dispatchers').child(user.id).once('value')
      .then((snapshot) => {
        const data = snapshot.val();
        user.name = data.name;
        dispatch(setUser(user));
      })
      .catch(err => {
        dispatch(setError('Failed to load user', err));
      });
  });
}

function loadEvents() {
  return (dispatch => {
    firebase.database().ref('/calls').once('value')
      .then((snapshot) => {
        let events = objectToArray(snapshot.val());
        events.sort((c1, c2) => {
          if (c1.timestamp > c2.timestamp)
            return -1;
          if (c1.timestamp < c2.timestamp)
            return 1;
          return 0;
        });
        dispatch(setEvents(events));
        const timestamp = events.length > 0 ? events[0].timestamp + 1 : 0;
        firebase.database().ref('/calls').orderByChild('timestamp').startAt(timestamp).on('child_added', (data) => {
          let event = data.val();
          event.key = data.key;
          dispatch(addEvent(event));
        });
        firebase.database().ref('/calls').on('child_changed', (data) => {
          let event = data.val();
          event.key = data.key;
          dispatch(setEvent(event));
        });
      })
      .catch(err => {
        if (err) {
          dispatch(setError('Failed to load data!', err));
        }
      });
  });
}

function setError(message, err){
  console.error(message, err);
  return {
    type: SET_ERROR,
    message,
    err
  };
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

function setEvents(events){
  return {
    type: SET_EVENTS,
    events,
  };
}

function setEvent(event){
  return {
    type: SET_EVENT,
    event,
  };
}

function addEvent(event){
  return {
    type: ADD_EVENT,
    event,
  };
}