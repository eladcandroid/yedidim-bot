import { types, destroy, flow, getRoot } from 'mobx-state-tree'
import * as api from 'io/api'
import loadCategories from 'io/category'
import { trackEvent } from 'io/analytics'
import Event from './Event'
import Category from './Category'

export default types
  .model('EventStore', {
    events: types.map(Event),
    categories: types.array(Category),
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
      return self.allEvents.slice().sort((a, b) => {
        if (a.isTaken === b.isTaken) {
          return a.timestamp - b.timestamp
        }
        // display taken events last
        return a.isTaken ? 1 : -1
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
        self.removeAllEvents()
        events.forEach(addEvent)
      }),
      removeEvent(eventId) {
        destroy(self.events.get(eventId))
      },
      removeAllEvents: () => {
        self.events.values().forEach(event => {
          // Remove all events apart from the assigned to the user
          if (!event.isAssigned) {
            self.removeEvent(event.id)
          }
        })
      },
      addEventFromNotification: eventId => {
        addEvent({ id: eventId })

        api.acknowledgeReceivedEvent(
          eventId,
          getRoot(self).authStore.currentUser.id
        )

        trackEvent('EventNotificationReceived', {
          eventId
        })
      },
      setLoading: isLoading => {
        self.isLoading = isLoading
      },
      setCategories: categories => {
        self.categories.replace(categories)
      },
      initAfterAuth: async () => {
        // Load categories from API
        self.setCategories(await loadCategories())
      }
    }
  })
