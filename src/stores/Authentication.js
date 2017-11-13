import { types, getParent, flow } from 'mobx-state-tree'
import * as api from './api'

export const User = types.model('User', {
  guid: types.identifier(),
  name: types.string,
  phone: types.string
})

const AuthenticationStore = types
  .model('AuthenticationStore', {
    isLoading: true,
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
    function onUserChanged({ userAuth, userInfo }) {
      if (!userAuth) {
        // Not authenticated
        self.currentUser = null
      } else {
        console.log('>>>> Authenticated Changed!', userAuth, userInfo)
        self.currentUser = User.create({
          guid: userAuth.phoneNumber,
          name: `${userInfo.FirstName} ${userInfo.LastName}`,
          phone: userInfo.MobilePhone
        })
      }

      self.isLoading = false
    }

    function onError(error) {
      console.log('>>>>', error)
      self.error = error
      self.isLoading = false
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
      this.isLoading = true
      this.error = null

      try {
        const { userAuth, userInfo } = yield api.signIn({
          verificationId,
          code
        })
        console.log('Logged In!', userAuth, userInfo)
      } catch (error) {
        this.error = error
      }
    })

    const signOut = flow(function* signOut() {
      this.isLoading = true
      this.error = null

      try {
        yield api.signOut()
        console.log('Logged Out!')
      } catch (error) {
        this.error = error
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
