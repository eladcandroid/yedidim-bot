import * as firebase from 'firebase'
import { Constants } from 'expo'
import Config from '../Config.json'

firebase.initializeApp(Config.firebase[Constants.manifest.extra.instance])

// For debug purposes only
firebase.auth().onAuthStateChanged(user => {
  if (user) {
    // console.log('User signed in !', user)
  } else {
    // console.log('NO user signed in !')
  }
})

export function loggedInUser() {
  return new Promise(resolve => {
    const unsubscribe = firebase.auth().onAuthStateChanged(user => {
      unsubscribe()
      resolve(user)
    })
  })
}

export function signIn(verificationId, code) {
  // console.log('signIn!', verificationId, code)

  return firebase
    .auth()
    .signInWithCredential(
      firebase.auth.PhoneAuthProvider.credential(verificationId, code)
    )
  // .catch(function(err) {
  //  console.log("failed to sign in", err);
  // });
}

export function signOut() {
  // console.log('signOut!')
  return firebase
    .auth()
    .signOut()
    .catch(() => {
      // console.log('failed to sign out', err)
    })
}
