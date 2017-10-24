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

  const recaptchaVerifier = new firebase.auth
    .RecaptchaVerifier("sign-in-button", {
    size: "invisible",
    callback: function(response) {
      // reCAPTCHA solved, allow signInWithPhoneNumber.
      firebase
        .auth()
        .signInWithPhoneNumber("+447951597511", recaptchaVerifier)
        .then(function(confirmationResult) {
          console.log(
            "SMS sent. Prompt user to type the code from the message, then sign the",
            confirmationResult
          );
          // user in with confirmationResult.confirm(code).
          // window.confirmationResult = confirmationResult;
        })
        .catch(function(error) {
          console.log("Error; SMS not sent", error);
        });
    }
  });

  // firebase
  //   .auth()
  //   .signInWithEmailAndPassword("test@yedidim.org", "testes")
  //   .catch(function(err) {
  //     console.log("failed to sign in", err);
  //   });
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
