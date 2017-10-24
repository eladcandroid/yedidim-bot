import * as firebase from "firebase";
import Config from "../Config.json";

firebase.initializeApp(Config.firebase);

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    console.log("User signed in !", user);
  } else {
    console.log("NO user signed in !");
  }
});

export default function signIn() {
  console.log("signIn!");
  firebase
    .auth()
    .signInWithEmailAndPassword("test@yedidim.org", "testes")
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
