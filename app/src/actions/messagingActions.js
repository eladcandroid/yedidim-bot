import * as firebase from 'firebase';
import { SET_ERROR, SET_MESSAGING_TOKEN, SET_MESSAGING_PERMISSION } from '../constants/actionTypes';

let messaging;

export function initMessaging() {
  return ((dispatch, getState) => {
    messaging = firebase.messaging();

    messaging.onTokenRefresh(function() {
      dispatch(getToken());
    });

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./' + (getState().dataSource.production ? '' : 'scripts/') + 'firebase-messaging-sw.js')
        .then((registration) => {
          messaging.useServiceWorker(registration);
          // dispatch(requestPermission());
        })
        .catch(() => {
          dispatch(setMessagingPermission(false));
        })
    } else {
      dispatch(setMessagingPermission(false));
    }
  });
}

export function requestPermission() {
  return ((dispatch) => {
    messaging.requestPermission()
      .then(function () {
        // console.log('Notification permission granted.');
        dispatch(getToken());
      })
      .catch(function (err) {
        dispatch(setMessagingPermission(false));
        dispatch(showError('Permissions were not granted', err));
      });
  });
}

function getToken() {
  return ((dispatch) => {
    messaging.getToken()
      .then(function (token) {
        if (token) {
          console.log('Token was retrieved: ' + token);
          dispatch(setMessagingPermission(true));
          dispatch(storeMessagingToken(token));
        } else {
          dispatch(setMessagingPermission(false));
          dispatch(showError('Failed to retrieve token. Request permission to generate one.'));
        }
      })
      .catch(function (err) {
        dispatch(setMessagingPermission(false));
        dispatch(showError('An error occurred while retrieving token. ', err));
      });
  });
}

export function deleteToken() {
  return ((dispatch) => {
    if (!messaging){
      messaging = firebase.messaging();
    }
    messaging.getToken()
      .then(function (token) {
        messaging.deleteToken(token)
          .then(function () {
            // console.log('Token deleted.');
            dispatch(storeMessagingToken());
          })
          .catch(function (err) {
            dispatch(showError('Unable to delete token. ', err));
          });
      })
      .catch(function (err) {
        dispatch(showError('Unable to delete token. ', err));
      });
  });
}

function storeMessagingToken(token) {
  //TODO handle delete token
  return ((dispatch, getState) => {
    const state = getState();
    const userKey = state.dataSource.user.email.split('.', 1);
    firebase.database().ref('users/' + userKey).set({token}, (err) => {
      if (err) {
        // dispatch(setError({title:"Failed to update!", message: err}));
      } else {
        dispatch(setMessagingToken(token));
      }
    });
  });
}

export function setMessagingPermission(permission){
  return {
    type: SET_MESSAGING_PERMISSION,
    permission
  };
}

function setMessagingToken(token){
  return {
    type: SET_MESSAGING_TOKEN,
    token
  };
}

function showError(message, err){
  return {
    type: SET_ERROR,
    message,
    err
  };
}

// messaging.onMessage(function(payload) {
//   console.log("Message received. ", payload);
//   // appendMessage(payload);
// });