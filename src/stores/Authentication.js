import MobxFirebaseStore from 'mobx-firebase-store'
import { action, observable, computed } from 'mobx'
import firebase from 'firebase'
import { Permissions, Notifications } from 'expo'

export default class AuthenticationStore {
  @observable authUser = null
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
      this.unwatchAuth = firebase
        .auth(this.fbApp)
        .onAuthStateChanged(async authUser => {
          this.authUser = authUser
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

  registerForPushNotificationsAsync = async () => {
    const { status: existingStatus } = await Permissions.getAsync(
      Permissions.NOTIFICATIONS
    )
    let finalStatus = existingStatus

    // only ask if permissions have not already been determined, because
    // iOS won't necessarily prompt the user a second time.
    if (existingStatus !== 'granted') {
      // Android remote notification permissions are granted during the app
      // install, so this will only ask on iOS
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS)
      finalStatus = status
    }

    // Stop here if the user did not grant permissions
    if (finalStatus !== 'granted') {
      throw {
        code: 'Notification not granted',
        message: 'User did not granted notification permissions'
      }
    }

    // Get the token that uniquely identifies this device
    return Notifications.getExpoPushTokenAsync()
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
  saveNotificationToken = async () => {
    const notificationToken = await this.registerForPushNotificationsAsync()

    return firebase
      .database(this.fbApp)
      .ref(`/volunteer/${this.authUser.phoneNumber}`)
      .update({ notificationToken })
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

      this.authUser = authUser
      this.user = await this.userInfo(authUser)
      this.isAuthenticating = false
      return this.user
    } catch (error) {
      this.isAuthenticating = false
      this.authError = error
      return error
    }
  }

  @action
  signOut = async () => {
    await firebase.auth(this.fbApp).signOut()
    this.authUser = null
    this.user = null
  }
}
