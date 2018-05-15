import { types, flow, getRoot, getParent } from 'mobx-state-tree'
import GeoFire from 'geofire'
import * as api from 'io/api'
import { trackEvent } from 'io/analytics'
import { categoryImg } from 'const'
import locationHandler from '../../phoneInterface/locationHandler'
import Dispatcher from './Dispatcher'

const calculateDistanceFromEvent = async event => {
  try {
    return GeoFire.distance(await locationHandler.getLocationIfPermitted(), [
      event.lat,
      event.lon
    ])
  } catch (error) {
    return null
  }
}

export default types
  .model('Event', {
    id: types.identifier(),
    address: types.maybe(types.string),
    caller: types.maybe(types.string),
    carType: types.maybe(types.string),
    category: types.maybe(types.string),
    subCategory: types.maybe(types.string),
    city: types.maybe(types.string),
    lat: types.maybe(types.number),
    lon: types.maybe(types.number),
    more: types.maybe(types.string),
    phone: types.maybe(types.string),
    privateInfo: types.maybe(types.string),
    status: types.maybe(types.string),
    assignedTo: types.maybe(types.string),
    timestamp: types.maybe(types.Date),
    distance: types.maybe(types.number),
    dispatcher: types.maybe(Dispatcher),
    isLoading: false
  })
  .views(self => ({
    get store() {
      return getParent(self, 2)
    },
    get isReadyForAssignment() {
      return self.status === 'sent' || self.status === 'submitted'
    },
    get isAssigned() {
      return (
        self.status === 'assigned' &&
        self.id === getRoot(self).authStore.currentUser.acceptedEventId
      )
    },
    get isTaken() {
      return (
        (self.status === 'assigned' &&
          self.assignedTo !== getRoot(self).authStore.currentUser.id) ||
        self.status === 'completed'
      )
    },
    get displayAddress() {
      return self.address && self.address.replace(/, ישראל$/, '')
    },
    get categoryName() {
      const category = getRoot(self).eventStore.categories.find(
        entry => entry.id === self.category
      )

      if (category) {
        const subCategory = (category.subCategories) ? category.subCategories.find(
          entry => entry.id === self.subCategory
        ) : null;

        return subCategory
          ? `${category.displayName}/${subCategory.displayName}`
          : category.displayName
      }

      return 'אחר'
    },
    get categoryImg() {
      return categoryImg(self.category)
    }
  }))
  .actions(self => ({
    onEventUpdated: flow(function* onEventUpdated(eventData) {
      eventData.distance =
        eventData.distance ||
        self.distance ||
        (yield calculateDistanceFromEvent(eventData))
      Object.assign(self, eventData)

      const shouldFetchDispatcher =
        !self.dispatcher && eventData.dispatcherId && self.isAssigned
      if (shouldFetchDispatcher) {
        self.isLoading = true
        self.dispatcher = yield api.fetchDispatcher(eventData.dispatcherId)
      }
      // Not loading anymore (if it was loading)
      self.isLoading = false
    }),
    afterCreate: () => {
      // If no data is provided with event, set it as loading
      if (!self.address || !self.category) {
        self.isLoading = true
      }
      self.unsubscribeId = api.subscribeToEvent(self.id, self.onEventUpdated)
    },
    beforeDestroy: () => {
      api.unsubscribeToEvent(self.id, self.unsubscribeId)
    },
    remove: () => {
      trackEvent('IgnoreEvent', {
        eventId: self.id
      })
      self.store.removeEvent(self.id)
    },
    accept: flow(function* accept() {
      // Retrieve current logged user id
      self.store.setLoading(true)
      const currentUserId = getRoot(self).authStore.currentUser.id
      const results = yield api.acceptEvent(self.id, currentUserId)
      self.store.setLoading(false)
      trackEvent('AcceptEvent', {
        eventId: self.id
      })
      return results
    }),
    finalise: flow(function* finalise(feedback) {
      // Retrieve current logged user id
      self.store.setLoading(true)
      const currentUserId = getRoot(self).authStore.currentUser.id
      const results = yield api.finaliseEvent(self.id, currentUserId, feedback)
      self.store.setLoading(false)
      trackEvent('FinaliseEvent', {
        eventId: self.id
      })
      return results
    }),
    unaccept: flow(function* unaccept(feedback) {
      // Retrieve current logged user id
      self.store.setLoading(true)
      const currentUserId = getRoot(self).authStore.currentUser.id
      const results = yield api.unacceptEvent(self.id, currentUserId, feedback)
      self.store.setLoading(false)
      trackEvent('UnacceptEvent', {
        eventId: self.id
      })
      return results
    })
  }))
