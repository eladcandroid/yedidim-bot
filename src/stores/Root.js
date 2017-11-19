import { types } from 'mobx-state-tree'
import AuthenticationStore from './Authentication'
import EventStore from './Event'

const RootStore = types.model('RootStore', {
  authStore: types.optional(AuthenticationStore, {
    user: null
  }),
  eventStore: types.optional(EventStore, {
    events: {}
  })
})

export default RootStore
