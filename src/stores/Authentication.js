import { types, getParent, flow } from 'mobx-state-tree'
import * as api from 'io/api'
import { trackUserLogin, trackEvent } from 'io/analytics'

export const User = types
  .model('User', {
    id: types.identifier(),
    name: types.string,
    phone: types.string,
    muted: types.maybe(types.Date),
    acceptedEventId: types.maybe(types.string)
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
    })
  }))

const AuthenticationStore = types
  .model('AuthenticationStore', {
    isInitializing: true,
    isLoading: false,
    currentUser: types.maybe(types.reference(User)),
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
        self.currentUser = User.create(userInfo)
      }

      trackUserLogin(self.currentUser && self.currentUser.id)

      self.isInitializing = false
    }

    function onError(error) {
      console.log('onError', error) // TODO Throw ?
      self.error = error
      self.isInitializing = false
    }

    function afterCreate() {
      self.unwatchAuth = api.onAuthenticationChanged(
        self.onUserChanged,
        self.onError
      )
    }

    function beforeDestroy() {
      self.unwatchAuth()
    }

    const signIn = flow(function* signIn({ verificationId, code }) {
      trackEvent('SignIn')
      self.isLoading = true
      self.error = null

      try {
        yield api.signIn({
          verificationId,
          code
        })
        self.isLoading = false
        trackEvent('SignInSuccess')
      } catch (error) {
        self.error = error
        self.isLoading = false
        trackEvent('SignInError', { error })
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
      signIn,
      signOut,
      onUserChanged,
      onError
    }
  })

export default AuthenticationStore
