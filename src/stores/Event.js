import { types } from 'mobx-state-tree'
import { runInAction } from 'mobx'
import { AsyncStorage } from 'react-native'
import * as api from './api'

export const Event = types
  .model('Event', {
    guid: types.identifier(),
    status: types.maybe(types.string),
    timestamp: types.maybe(types.Date),
    address: types.maybe(types.string),
    caller: types.maybe(types.string),
    carType: types.maybe(types.string),
    type: types.maybe(types.number), // case in FB
    city: types.maybe(types.string),
    fullAddress: types.maybe(types.string),
    lat: types.maybe(types.number),
    lon: types.maybe(types.number),
    more: types.maybe(types.string),
    phone: types.maybe(types.string),
    streetName: types.maybe(types.string),
    streetNumber: types.maybe(types.number),
    isLoading: true
  })
  .actions(self => ({
    onEventUpdated: eventData => {
      // console.log('subscribed to event triggered', eventData)
      // Update properties
      Object.assign(self, eventData)
      // Not loading anymore (if it was loading)
      self.isLoading = false
    },
    afterCreate: () => {
      // console.log('onAfterCreate added by notification', self.guid)
      self.unwatchAuth = api.subscribeToEvent(self.guid, eventData => {
        runInAction(() => {
          self.onEventUpdated(eventData)
        })
      })
    },
    beforeDestroy: () => {
      self.unwatchAuth()
    }
  }))

const EventStore = types
  .model('EventStore', {
    events: types.map(Event)
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
    }
  }))
  .actions(self => ({
    afterCreate: async () => {
      const serialEvents = await AsyncStorage.getItem('@YedidimNative:events')
      if (!serialEvents) {
        // Set initial value
        await AsyncStorage.setItem('@YedidimNative:events', JSON.stringify({}))
      } else {
        // Reload events after app restart
        Object.keys(JSON.parse(serialEvents)).forEach(eventId =>
          self.addEvent(eventId)
        )
      }
    },
    addEvent: eventId => {
      // If no event was added, add new to store
      if (!self.events.get(eventId)) {
        self.events.put(
          Event.create({
            guid: eventId
          })
        )
      }
    },
    addEventFromNotification: eventId => {
      // Add event to async store for restoring on app restart
      const newEvent = {}
      newEvent[eventId] = true
      AsyncStorage.mergeItem('@YedidimNative:events', JSON.stringify(newEvent))

      self.addEvent(eventId)
    }
  }))
export default EventStore
