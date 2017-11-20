import { types } from 'mobx-state-tree'
import { runInAction } from 'mobx'
import * as api from './api'

export const Event = types
  .model('Event', {
    guid: types.identifier(),
    // status: types.string,
    // timestamp: types.Date,
    // address: types.string,
    caller: '',
    // carType: types.string,
    // type: types.string, // case
    // city: types.string,
    // fullAddress: types.string,
    // lat: types.number,
    // lon: types.number,
    // more: types.string,
    // phone: types.string,
    // streetName: types.string,
    // streetNumber: types.string,
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
