import { types } from 'mobx-state-tree'
import AuthenticationStore from './Authentication'

const RootStore = types.model('RootStore', {
  authStore: types.optional(AuthenticationStore, {
    user: null
  })
})

export default RootStore
