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
    isLoading: false,
    lastUpdatedDate: new Date().getTime()
  })
  .views(self => ({
    findById(eventId) {
      return self.events.get(eventId)
    },
    /*    get allEvents() {
      return [
        {
          id: 1,
          address: 'Rothschild 3',
          caller: 'Ariel',
          carType: 'Pick up',
          category: 'Random',
          subCategory: 'Random',
          city: 'Tel Aviv',
          lat: '1111111111',
          lon: '2222222222',
          more: 'Flat tire in the street',
          phone: '5566557766',
          privateInfo: '',
          status: '',
          assignedTo: 'John Johnson',
          timestamp: new Date(2018, 1, 1),
          distance: '',
          dispatcher: '',
          isLoading: false
        }
      ]
    },
    get hasEvents() {
      return self.events.size > 0
    }, */
    get allEvents() {
      if (self.events.values().length > 0) {
        return self.events.values()
      }
      return [
        {
          id: 1,
          address: 'Rothschild 3',
          caller: 'Ariel',
          carType: 'Pick up',
          category: 'Random',
          subCategory: 'Random',
          city: 'Tel Aviv',
          lat: '1111111111',
          lon: '2222222222',
          more: 'Flat tire in the street',
          phone: '5566557766',
          privateInfo: '',
          status: '',
          assignedTo: 'John Johnson',
          timestamp: new Date(2018, 1, 1),
          distance: '',
          dispatcher: '',
          isLoading: false,
          isTaken: true
        }
      ]
    },
    get hasEvents() {
      // return self.events.size > 0
      return true
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
      self.lastUpdatedDate = new Date().getTime()
    }

    return {
      loadLatestOpenEvents: flow(function* loadLatestOpenEvents() {
        const currentUserId = getRoot(self).authStore.currentUser.id
        const events = yield api.loadLatestOpenEvents(currentUserId)
        self.removeAllEvents()
        events.forEach(addEvent)
        self.lastUpdatedDate = new Date().getTime()
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
