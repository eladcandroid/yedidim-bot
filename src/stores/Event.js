import { types, destroy, flow, getRoot, getParent } from 'mobx-state-tree'
import * as api from '../io/api'
import * as storage from '../io/storage'

const EventCases = [
  'כבלים',
  "פנצ'ר",
  'קומפרסור',
  'דלת נעולה',
  'שמן\\מים\\דלק',
  'חילוץ',
  'קודנית',
  "פנצ'ר (אין רזרבי)",
  'אחר'
]

const EventImages = [
  'http://res.cloudinary.com/rfellc/image/upload/v1378102221/generic-jumper-cables_dp4vec.jpg',
  'https://static.pakwheels.com/2016/05/tyre-repair-kit.jpg',
  'http://img.zap.co.il/pics/2/0/0/3/36953002c.gif',
  'https://i.ytimg.com/vi/Os8orEBjE34/maxresdefault.jpg',
  'http://c1.peakpx.com/wallpaper/419/176/971/gasoline-diesel-petrol-gas-fuel-oil-wallpaper.jpg',
  'http://www.grar-grira.co.il/wp-content/uploads/2016/08/39546080_m.jpg',
  'http://adi-system.co.il/wp-content/uploads/epander//2016/08/%D7%A7%D7%95%D7%93%D7%A0%D7%99%D7%AA-%D7%A1%D7%95%D7%91%D7%90%D7%A8%D7%95-%D7%A4%D7%95%D7%A8%D7%A1%D7%98%D7%A8-B4.png',
  'https://static.pakwheels.com/2016/05/tyre-repair-kit.jpg',
  'https://imageog.flaticon.com/icons/png/512/36/36601.png?size=1200x630f&pad=10,10,10,10&ext=png&bg=FFFFFFFF'
]

export const Event = types
  .model('Event', {
    guid: types.identifier(),
    status: types.maybe(types.string),
    assignedTo: types.maybe(types.string),
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
  .views(self => ({
    get store() {
      return getParent(self, 2)
    },
    get eventType() {
      return EventCases[self.type]
    },
    get eventTypeImage() {
      return EventImages[self.type]
    },
    get isReadyForAssignment() {
      return self.status === 'sent' || self.status === 'submitted'
    },
    get isAssigned() {
      return (
        self.status === 'assigned' &&
        self.assignedTo === getRoot(self).authStore.currentUser.guid
      )
    },
    get isTaken() {
      return (
        (self.status === 'assigned' &&
          self.assignedTo !== getRoot(self).authStore.currentUser.guid) ||
        self.status === 'completed'
      )
    }
  }))
  .actions(self => ({
    onEventUpdated: eventData => {
      // Update properties
      Object.assign(self, eventData)
      // Not loading anymore (if it was loading)
      self.isLoading = false
    },
    afterCreate: () => {
      self.unsubscribeId = api.subscribeToEvent(self.guid, self.onEventUpdated)
    },
    beforeDestroy: () => {
      api.unsubscribeToEvent(self.guid, self.unsubscribeId)
    },
    remove: () => {
      self.store.removeEvent(self.guid)
    },
    accept: flow(function* accept() {
      // Retrieve current logged user id
      self.store.setLoading(true)
      const currentUserId = getRoot(self).authStore.currentUser.guid
      const results = yield api.acceptEvent(self.guid, currentUserId)
      self.store.setLoading(false)
      return results
    }),
    finalise: flow(function* finalise(feedback) {
      // Retrieve current logged user id
      self.store.setLoading(true)
      const currentUserId = getRoot(self).authStore.currentUser.guid
      const results = yield api.finaliseEvent(
        self.guid,
        currentUserId,
        feedback
      )
      self.store.setLoading(false)
      return results
    }),
    unaccept: flow(function* unaccept(feedback) {
      // Retrieve current logged user id
      self.store.setLoading(true)
      const currentUserId = getRoot(self).authStore.currentUser.guid
      const results = yield api.unacceptEvent(
        self.guid,
        currentUserId,
        feedback
      )
      self.store.setLoading(false)
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
    }
  }))
  .actions(self => {
    function addEvent(eventId) {
      // If no event was added, add new to store
      if (!self.events.get(eventId)) {
        self.events.put(
          Event.create({
            guid: eventId
          })
        )
      }
    }

    return {
      afterCreate: flow(function* afterCreate() {
        const eventIds = yield storage.eventIds()
        eventIds.forEach(eventId => addEvent(eventId))
      }),
      removeEvent: flow(function* removeEvent(eventId) {
        destroy(self.events.get(eventId))
        yield storage.removeEventId(eventId)
      }),
      removeAllEvents: () => {
        self.events.values().forEach(event => {
          self.removeEvent(event.guid)
        })
      },
      addEventFromNotification: eventId => {
        // Add event to async store for restoring on app restart
        storage.addEventId(eventId)

        addEvent(eventId)
      },
      setLoading: isLoading => {
        self.isLoading = isLoading
      }
    }
  })
export default EventStore
