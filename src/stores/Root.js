import { types } from 'mobx-state-tree'
import AuthenticationStore from './Authentication'
import EventStore from './Event'

const RootStore = types
  .model('RootStore', {
    authStore: types.optional(AuthenticationStore, {
      user: null
    }),
    eventStore: types.optional(EventStore, {
      events: {}
    }),
    language: 'en'
  })
  .views(self => ({
    get nextLanguage() {
      return self.language === 'en' ? 'עברית' : 'English'
    }
  }))
  .actions(self => ({
    toggleLanguage: () => {
      self.language = self.language === 'en' ? 'he' : 'en'
    }
  }))

export default RootStore
