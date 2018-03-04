import { types, destroy, flow, getRoot, getParent } from 'mobx-state-tree'
import * as api from 'io/api'
import { trackEvent } from 'io/analytics'

export const Event = types
  .model('Event', {
    id: types.identifier(),
    address: types.maybe(types.string),
    caller: types.maybe(types.string),
    carType: types.maybe(types.string),
    type: types.maybe(types.number), // case in FB
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
    }
  }))
  .actions(self => ({
    onEventUpdated: eventData => {
      // Update properties
      eventData.distance = eventData.distance || self.distance
      Object.assign(self, eventData)
      // Not loading anymore (if it was loading)
      self.isLoading = false
    },
    afterCreate: () => {
      // If no data is provided with event, set it as loading
      if (!self.address || !self.type) {
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

const EventStore = types
  .model('EventStore', {
    events: types.map(Event),
    isLoading: false
  })
  .views(self => ({
    findById(eventId) {
      return self.events.get(eventId)
    },
    get allEvents() {
      return self.events.values()
    },
    get hasEvents() {
      return self.events.size > 0
    },
    get sortedEventsByStatusAndTimestamp() {
      return self.allEvents.sort((a, b) => {
        if (a.isTaken == b.isTaken) {
          return a.timestamp - b.timestamp
        } else {
          // display taken events last
          return a.isTaken ? 1 : -1
        }
      })
    }
  }))
  .actions(self => {
    function addEvent(eventJSON) {
      if (!self.events.get(eventJSON.id)) {
        self.events.put(eventJSON)
      }
    }

    return {
      loadLatestOpenEvents: flow(function* loadLatestOpenEvents() {
        const currentUserId = getRoot(self).authStore.currentUser.id
        const events = yield api.loadLatestOpenEvents(currentUserId)
        events.forEach(addEvent)
      }),
      removeEvent(eventId) {
        destroy(self.events.get(eventId))
      },
      removeAllEvents: () => {
        self.events.values().forEach(event => {
          self.removeEvent(event.id)
        })
      },
      addEventFromNotification: eventId => {
        addEvent({ id: eventId })

        trackEvent('EventNotificationReceived', {
          eventId
        })
      },
      setLoading: isLoading => {
        self.isLoading = isLoading
      }
    }
  })
export default EventStore
