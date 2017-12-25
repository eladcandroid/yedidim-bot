import { types, flow } from 'mobx-state-tree'
import AuthenticationStore from './Authentication'
import EventStore from './Event'
import { setLanguage } from '../io/storage'

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
    },
    get isRTL() {
      return self.language !== 'en'
    },
    get isLoading() {
      return self.authStore.isLoading || self.eventStore.isLoading
    }
  }))
  .actions(self => ({
    toggleLanguage: flow(function* toggleLanguage() {
      const newLanguage = self.language === 'en' ? 'he' : 'en'
      yield setLanguage(newLanguage)
      self.language = newLanguage
    })
  }))

export default RootStore
