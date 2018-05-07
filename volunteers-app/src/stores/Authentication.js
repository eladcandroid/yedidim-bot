import { types, getParent, flow } from 'mobx-state-tree'
import * as api from 'io/api'
import { trackUserLogin, trackEvent } from 'io/analytics'
import { acknowledgeTestNotification } from 'io/notifications'

const CurrentUser = types
  .model('CurrentUser', {
    id: types.identifier(),
    name: types.string,
    phone: types.string,
    muted: types.maybe(types.Date),
    acceptedEventId: types.maybe(types.string),
    role: types.optional(
      types.enumeration('Role', ['volunteer', 'dispatcher', 'admin']),
      'volunteer'
    )
  })
  .views(self => ({
    get isMuted() {
      // is muted if muted exists and is less then 24 hours from now
      return !!(
        self.muted &&
        self.muted.getTime() > new Date().getTime() - 24 * 3600 * 1000
      )
    },
    get hasEventAssigned() {
      return !!self.acceptedEventId
    },
    get isAdmin() {
      return self.role === 'admin'
    }
  }))
  .actions(self => ({
    toggleMute: flow(function* toggleMute() {
      // if it is muted, then unmuted (remove field) or set new timestamp for now
      const newMute = self.isMuted ? null : new Date().getTime()

      trackEvent('ToggleMute', { mute: !!newMute })

      yield api.updateUser(self.id, {
        Muted: newMute
      })
    }),
    acknowledgeTestNotification: () => {
      acknowledgeTestNotification(self.id)
    }
  }))

const AuthenticationStore = types
  .model('AuthenticationStore', {
    isInitializing: true,
    isOffline: false,
    isLoading: false,
    currentUser: types.maybe(CurrentUser),
    error: types.maybe(types.string)
  })
  .views(self => ({
    get root() {
      return getParent(self)
    },
    get isAuthenticated() {
      return !!self.currentUser
    }
  }))
  .actions(self => {
    function onUserChanged(userInfo) {
      if (!userInfo) {
        // Not authenticated
        self.currentUser = null
      } else {
        self.currentUser = userInfo
      }

      trackUserLogin(self.currentUser && self.currentUser.id)

      self.isOffline = false
      self.isInitializing = false
    }

    function onError(error) {
      console.log('onError', error) // TODO Throw ?
      self.error = error
      self.isOffline = false
      self.isInitializing = false
    }

    function onOffline() {
      // If still initialiazing, then we are offline
      if (self.isInitializing) {
        // Unblock app
        self.isInitializing = false
        self.isOffline = true
      }
    }

    function afterCreate() {
      self.unwatchAuth = api.onAuthenticationChanged(
        self.onUserChanged,
        self.onError
      )

      // Wait to check offline in 15s
      setTimeout(self.onOffline, 15000)
    }

    function beforeDestroy() {
      self.unwatchAuth()
    }

    const signInWithPhone = flow(function* signInWithPhone({
      verificationId,
      code
    }) {
      trackEvent('PhoneSignIn')
      self.isLoading = true
      self.error = null

      try {
        yield api.signInWithPhone({
          verificationId,
          code
        })
        self.isLoading = false
        trackEvent('PhoneSignInSuccess')
      } catch (error) {
        self.error = error
        self.isLoading = false
        trackEvent('PhoneSignInError', { error })
      }
    })

    const signInWithEmailPass = flow(function* signInWithEmailPass({
      phoneNumber,
      id
    }) {
      trackEvent('EmailPassSignIn')
      self.isLoading = true
      self.error = null

      try {
        yield api.signInWithEmailPass({
          phoneNumber,
          id
        })
        self.isLoading = false
        trackEvent('EmailPassSignInSuccess')
      } catch (error) {
        self.error = error
        self.isLoading = false
        trackEvent('EmailPassSignInError', { error })
      }
    })

    const signOut = flow(function* signOut() {
      trackEvent('SignOut')
      self.isLoading = true
      self.error = null

      try {
        yield api.signOut()
        self.root.eventStore.removeAllEvents()
        self.isLoading = false
        trackEvent('SignOutSuccess')
      } catch (error) {
        trackEvent('SignOutError', { error })
        self.error = error
        self.isLoading = false
      }
    })

    return {
      afterCreate,
      beforeDestroy,
      signInWithEmailPass,
      signInWithPhone,
      signOut,
      onUserChanged,
      onError,
      onOffline
    }
  })

export default AuthenticationStore
