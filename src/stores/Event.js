import { types } from 'mobx-state-tree'
import { runInAction } from 'mobx'
import * as api from './api'

export const Event = types
  .model('Event', {
    guid: types.identifier(),
    status: types.maybe(types.string),
    timestamp: types.maybe(types.Date),
    address: types.maybe(types.string),
    caller: types.maybe(types.string),
    carType: types.maybe(types.string),
    type: types.maybe(types.string),
    city: types.maybe(types.string),
    fullAddress: types.maybe(types.string),
    lat: types.maybe(types.number),
    lon: types.maybe(types.number),
    more: types.maybe(types.string),
    phone: types.maybe(types.string),
    streetName: types.maybe(types.string),
    streetNumber: types.maybe(types.string),
    isLoading: true
  })
  .actions(self => ({
    onEventUpdated: eventData => {
      // console.log('subscribed to event triggered', eventData)
      // Update properties
      self.caller = eventData['caller name']
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
  .actions(self => ({
    addEvent: eventId => {
      self.events.put(
        Event.create({
          guid: eventId
        })
      )
    }
  }))
export default EventStore
