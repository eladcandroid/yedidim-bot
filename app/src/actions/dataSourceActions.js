import * as firebase from 'firebase';
import { SET_USER, REMOVE_USER, SET_EVENTS, SET_EVENT, ADD_EVENT, SET_NOTIFICATIONS, SET_ERROR } from '../constants/actionTypes';
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
  },
  production: {
    apiKey: "AIzaSyC6bf7YfKoompBlyjw382AJZOzTvLaY7P0",
    authDomain: "yedidim-production.firebaseapp.com",
    databaseURL: "https://yedidim-production.firebaseio.com",
    projectId: "yedidim-production",
    storageBucket: "yedidim-production.appspot.com",
    messagingSenderId: "33558411934"
  }

};

firebase.initializeApp(firebaseConfig[Expo.Constants.manifest.extra.instance]);

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

export function signIn(id, phone, onError) {
  return (dispatch => {
    const email = id + '@yedidim.org';
    firebase.auth().signInWithEmailAndPassword(email, phone)
      .catch(function (err) {
        console.log('failed to sign in', err);
        onError('פרטים שגויים. נסה שנית');
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
      notifications: true,
      time: new Date(),
      version: getState().dataSource.version
    }, (err) => {
      if (err) {
        dispatch(setError('Unable to set token. ', err));
      } else {
        dispatch(setNotifications(true));
        console.log('Token was set', token);
      }
    });
  });
}

export function enableNotifications(enable) {
  return ((dispatch, getState) => {
    if (enable){
      dispatch(setNotifications(true));
      dispatch(registerForPushNotifications());
    } else {
      firebase.database().ref('dispatchers/' + getState().dataSource.user.id).update({
        notifications: false
      }, (err) => {
        if (err) {
          dispatch(setError('Unable to disable notifications. ', err));
        } else {
          dispatch(setNotifications(false));
        }
      });
    }
  });
}

export function signOutUser() {
  return ((dispatch, getState) => {
    deleteNotificationToken(getState().dataSource.user).then(() => {
      firebase.auth().signOut().then(() => {
        dispatch(handleSignedOutUser());
      });
    });
  });
}

export function updateEventStatus(event, status) {
  const updatedEvent = Object.assign({}, event, {status});
  return (dispatch => {
    firebase.database().ref('events/' + event.key).set(updatedEvent, (err) => {
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
    dispatch(loadUserData(user));
    dispatch(loadEvents());
  });
}

function handleSignedOutUser() {
  return (dispatch => {
    dispatch(removeUser());
  });
}

function deleteNotificationToken(user) {
  return new Promise (resolve => {
    firebase.database().ref('dispatchers/' + user.id).update({
      notifications: false
    }, (err) => {
      if (err) {
        console.error('Unable to remove token. ', err);
      } else {
        console.log('Token was removed');
      }
      resolve();
    });
  });
}

function loadUserData(user) {
  return (dispatch => {
    firebase.database().ref('/dispatchers').child(user.id).once('value')
      .then((snapshot) => {
        const data = snapshot.val();
        user.name = data.name;
        user.notifications = data.notifications;
        dispatch(setUser(user));
        if (!data.token || !data.notifications){
          dispatch(registerForPushNotifications());
        }
      })
      .catch(err => {
        dispatch(setError('Failed to load user', err));
      });
  });
}

function loadEvents() {
  return (dispatch => {
    firebase.database().ref('/events').once('value')
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
        firebase.database().ref('/events').orderByChild('timestamp').startAt(timestamp).on('child_added', (data) => {
          let event = data.val();
          event.key = data.key;
          dispatch(addEvent(event));
        });
        firebase.database().ref('/events').on('child_changed', (data) => {
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

function setNotifications(notifications){
  return {
    type: SET_NOTIFICATIONS,
    notifications
  }
}