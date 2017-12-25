import { types, getParent, flow } from 'mobx-state-tree'
import * as api from '../io/api'

export const User = types
  .model('User', {
    guid: types.identifier(),
    name: types.string,
    phone: types.string,
    muted: types.maybe(types.Date)
  })
  .views(self => ({
    get isMuted() {
      // is muted if muted exists and is less then 24 hours from now
      return !!(
        self.muted &&
        self.muted.getTime() > new Date().getTime() - 24 * 3600 * 1000
      )
    }
  }))
  .actions(self => ({
    toggleMute: flow(function* toggleMute() {
      // if it is muted, then unmuted (remove field) or set new timestamp for now
      yield api.updateUser(self.guid, {
        Muted: self.isMuted ? null : new Date().getTime()
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
      self.isLoading = true
      self.error = null
      console.log('SIGNIN', self.isLoading)
      try {
        // const { userAuth, userInfo } = yield api.signIn({
        yield api.signIn({
          verificationId,
          code
        })
        self.isLoading = false
        // console.log('Logged In!', userAuth, userInfo)
      } catch (error) {
        console.log('ERROR', error)
        self.error = error
        self.isLoading = false
      }
    })

    const signOut = flow(function* signOut() {
      self.isLoading = true
      self.error = null

      try {
        yield api.signOut()
        self.isLoading = false
      } catch (error) {
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
