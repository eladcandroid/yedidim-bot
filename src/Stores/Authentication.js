import MobxFirebaseStore from 'mobx-firebase-store'
import { action, observable, computed } from 'mobx'
import firebase from 'firebase'

export default class AuthenticationStore {
  @observable user = null
  @observable isAuthenticating = true
  @observable authError = null

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
  signIn = async ({ verificationId, code }) => {
    this.isAuthenticating = true
    this.authError = null

    try {
      const user = await firebase
        .auth(this.fbApp)
        .signInWithCredential(
          firebase.auth.PhoneAuthProvider.credential(verificationId, code)
        )

      this.isAuthenticating = false
      return user
    } catch (error) {
      this.isAuthenticating = false
      this.authError = error
      return error
    }
  }

  @action signOut = async () => firebase.auth(this.fbApp).signOut()
}
