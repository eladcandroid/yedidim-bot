import { types, flow } from 'mobx-state-tree'
import { setLanguage } from 'io/storage'
import { trackEvent } from 'io/analytics'
import AuthenticationStore from './Authentication'
import EventStore from './Events'

const RootStore = types
  .model('RootStore', {
    authStore: types.optional(AuthenticationStore, {
      user: null
    }),
    eventStore: types.optional(EventStore, {
      events: {}
    }),
    language: types.enumeration('Language', ['en', 'he'])
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
      trackEvent('ToggleLanguage', { language: newLanguage })
    })
  }))

export default RootStore
