import MobxFirebaseStore from 'mobx-firebase-store'
import { action, observable, computed } from 'mobx'
import firebase from 'firebase'

export default class AuthenticationStore {
  @observable user = null
  @observable userInfo = null
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
      this.unwatchAuth = firebase
        .auth(this.fbApp)
        .onAuthStateChanged(async authUser => {
          this.user = await this.userInfo(authUser)
          this.isAuthenticating = false
        })
    }
  }

  cleanup() {
    if (this.unwatchAuth) {
      this.unwatchAuth()
    }
  }

  userInfo = async authenticatedUser => {
    if (!authenticatedUser) {
      return undefined
    }

    const snapshot = await firebase
      .database(this.fbApp)
      .ref(`/volunteer/${authenticatedUser.phoneNumber}`)
      .once('value')

    if (snapshot.val()) {
      return snapshot.val()
    }

    /* eslint no-throw-literal: "off" */
    throw {
      code: 'Volunteer not registered',
      message:
        'Your user was not registered as a volunteer. Please contact dispatcher to register.'
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
      const authUser = await firebase
        .auth(this.fbApp)
        .signInWithCredential(
          firebase.auth.PhoneAuthProvider.credential(verificationId, code)
        )

      this.user = await this.userInfo(authUser)
      this.isAuthenticating = false
      return this.user
    } catch (error) {
      this.isAuthenticating = false
      this.authError = error
      return error
    }
  }

  @action signOut = async () => firebase.auth(this.fbApp).signOut()
}
