import MobxFirebaseStore from 'mobx-firebase-store'
import { action, observable, computed } from 'mobx'
import firebase from 'firebase'

export default class AuthenticationStore {
  @observable user = null
  @observable isAuthenticating = true

  constructor(fbApp, { watchAuth = true } = {}) {
    this.fbApp = fbApp

    // unsubscribeDelayMs is an optimization for paging to prevent flickering empty data:
    // - give some time for new page to come before unsubscribing/removing data for current page
    this.mobxStore = new MobxFirebaseStore(firebase.database(fbApp).ref(), {
      unsubscribeDelayMs: 1000
    })

    // AUTH
    // TODO figure out when unwatchAuth should be called
    if (watchAuth) {
      this.unwatchAuth = firebase.auth(this.fbApp).onAuthStateChanged(user => {
        this.user = user
        this.isAuthenticating = false
      })
    }
  }

  cleanup() {
    if (this.unwatchAuth) {
      this.unwatchAuth()
    }
  }

  // Getters
  @computed
  get isAuthenticated() {
    return !!this.user
  }

  @action
  signIn({ verificationId, code }) {
    this.isAuthenticating = true
    return firebase
      .auth(this.fbApp)
      .signInWithCredential(
        firebase.auth.PhoneAuthProvider.credential(verificationId, code)
      )
      .then(user => {
        this.isAuthenticating = false
        return user
      })
  }

  @action
  signOut() {
    return firebase.auth(this.fbApp).signOut()
  }
}
