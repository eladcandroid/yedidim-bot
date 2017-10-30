import * as firebase from "firebase";
import Config from "../Config.json";
import { Constants } from "expo";

firebase.initializeApp(Config.firebase[Constants.manifest.extra.instance]);

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    console.log("User signed in !", user);
  } else {
    console.log("NO user signed in !");
  }
});

export function signIn(verificationId, code) {
  console.log("signIn!", verificationId, code);

  return firebase
    .auth()
    .signInWithCredential(
      firebase.auth.PhoneAuthProvider.credential(verificationId, code)
    )
    .catch(function(err) {
      console.log("failed to sign in", err);
    });
}

export function signOut() {
  console.log("signOut!");
  firebase
    .auth()
    .signOut()
    .catch(function(err) {
      console.log("failed to sign out", err);
    });
}
