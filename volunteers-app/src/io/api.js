import firebase from 'firebase'
import GeoFire from 'geofire'
import { Location } from 'expo'
import * as phonePermissionsHandler from 'phoneInterface/phonePermissionsHandler'
import OneSignal from 'react-native-onesignal'
import { config } from '../config'

const EVENTS_SEARCH_RADIUS_KM = 20

async function registerForPushNotificationsAsync(userId) {
  return new Promise(resolve => {
    // Initialise One Signal
    OneSignal.init(config().oneSignalAppId)
    // Make sure we don't display alerts while in focus
    OneSignal.inFocusDisplaying(0)
    // Add event listener to grab userId
    OneSignal.addEventListener('ids', device => {
      firebase
        .database()
        .ref(`/volunteer/${userId}`)
        .update({ NotificationToken: device.userId })
      resolve(device.userId)
    })
    // Triggers the ids event listener to grab the userId
    OneSignal.configure()
  })
}

export async function updateUser(userKey, properties) {
  return firebase
    .database()
    .ref(`/volunteer/${userKey}`)
    .update(properties)
}

const userSnapshotToJSON = snapshot => ({
  name: `${snapshot.FirstName} ${snapshot.LastName}`,
  phone: snapshot.MobilePhone,
  muted: snapshot.Muted,
  acceptedEventId: snapshot.EventKey,
  role: snapshot.Role
})

// Store subscription so to be able to unsubscribe on logoff
let currentUserInfoSubscription

async function subscribeToUserInfo(
  userAuth,
  onChangeCallback,
  onErrorCallback
) {
  if (userAuth && (userAuth.phoneNumber || userAuth.email)) {
    const phoneNumber =
      userAuth.phoneNumber || userAuth.email.replace('@yedidim.org', '')

    // User authenticated, subscribe to get updated details
    const callback = snapshot => {
      if (snapshot && snapshot.val()) {
        onChangeCallback({
          id: phoneNumber,
          ...userSnapshotToJSON(snapshot.val())
        })
      } else {
        onErrorCallback('volunteer-not-registered')
      }
    }

    firebase
      .database()
      .ref(`volunteer/${phoneNumber}`)
      .on('value', callback)

    // Return callback used which the id for unsubscribing
    currentUserInfoSubscription = { callback, userKey: phoneNumber }
  } else {
    // No user authenticated yet, return undefined
    onChangeCallback()
  }
}

export function onAuthenticationChanged(onAuthentication, onError) {
  return firebase.auth().onAuthStateChanged(async userAuth => {
    subscribeToUserInfo(userAuth, onAuthentication, onError)
    if (userAuth && userAuth.phoneNumber) {
      await registerForPushNotificationsAsync(userAuth.phoneNumber)
    }
  })
}

export async function signInWithPhone({ verificationId, code }) {
  try {
    await firebase
      .auth()
      .signInWithCredential(
        firebase.auth.PhoneAuthProvider.credential(verificationId, code)
      )

    // Should have been subscribed to currentUserInfo already (check onAuthenticationChanged)
  } catch (error) {
    throw error.code
  }
}

export async function signInWithEmailPass({ phoneNumber, id }) {
  try {
    // TODO Support other countries ?
    const userId = `+972${phoneNumber
      .trim()
      .replace(/^0/, '')
      .replace(/-/g, '')}`

    await firebase
      .auth()
      .signInWithEmailAndPassword(`${userId}@yedidim.org`, id)

    // Should have been subscribed to currentUserInfo already (check onAuthenticationChanged)
  } catch (error) {
    throw error.code
  }
}

export async function signOut() {
  const { callback, userKey } = currentUserInfoSubscription

  // Remove notification token
  await firebase
    .database()
    .ref(`/volunteer/${userKey}`)
    .update({ NotificationToken: null })

  // Remove callback for updating user details
  await firebase
    .database()
    .ref(`volunteer/${userKey}`)
    .off('value', callback)

  return firebase.auth().signOut()
}

async function saveUserLocation(userId, latitude, longitude) {
  try {
    const geoFire = new GeoFire(firebase.database().ref('user_location'))
    await geoFire.set(userId, [latitude, longitude])
  } catch (e) {
    // TODO: error logging?
    console.error(e)
  }
}

const eventSnapshotToJSON = snapshot => ({
  id: snapshot.key,
  status: snapshot.status,
  assignedTo: snapshot.assignedTo,
  timestamp: snapshot.timestamp,
  address: snapshot.details.address,
  caller: snapshot.details['caller name'],
  carType: snapshot.details['car type'],
  category: snapshot.details.category,
  subCategory: snapshot.details.subCategory,
  city: snapshot.details.city,
  lat: snapshot.details.geo.lat,
  lon: snapshot.details.geo.lon,
  more: snapshot.details.more,
  phone: snapshot.details['phone number'],
  privateInfo: snapshot.details.private_info,
  distance: snapshot.distance,
  dispatcherId: snapshot.dispatcher,
  sentNotification:
    snapshot.notifications &&
    snapshot.notifications.volunteers &&
    snapshot.notifications.volunteers.sent
      ? Object.keys(snapshot.notifications.volunteers.sent).filter(
          userId => !snapshot.notifications.volunteers.sent[userId]
        )
      : [],
  receivedNotification:
    snapshot.notifications &&
    snapshot.notifications.volunteers &&
    snapshot.notifications.volunteers.sent
      ? Object.keys(snapshot.notifications.volunteers.sent).filter(
          userId => snapshot.notifications.volunteers.sent[userId]
        )
      : [],
  errorNotification:
    snapshot.notifications &&
    snapshot.notifications.volunteers &&
    snapshot.notifications.volunteers.error
      ? Object.keys(snapshot.notifications.volunteers.error)
      : []
})

async function fetchLatestOpenEventsLocationBased(userId) {
  return new Promise(async (resolve, reject) => {
    try {
      const currentLocation = await Location.getCurrentPositionAsync({
        enableHighAccuracy: true
      })
      const { latitude, longitude } = currentLocation.coords
      saveUserLocation(userId, latitude, longitude)
      const nearEventIdToDistance = {}
      const geoFire = new GeoFire(
        firebase
          .database()
          .ref()
          .child('event-location')
      )
      const geoQuery = geoFire.query({
        center: [latitude, longitude],
        radius: EVENTS_SEARCH_RADIUS_KM
      })

      geoQuery.on('key_entered', (eventId, location, distance) => {
        nearEventIdToDistance[eventId] = distance
      })

      geoQuery.on('ready', () => {
        geoQuery.cancel()
        firebase
          .database()
          .ref('events')
          .orderByChild('status')
          .startAt('assigned')
          .endAt('sent')
          .once('value', snapshot => {
            const eventsById = snapshot.val() || {}
            const fetchedEvents = Object.values(eventsById)
            const eventsToReturn = Object.keys(eventsById)
              .filter(eventId => !!nearEventIdToDistance[eventId])
              .filter(
                eventId =>
                  eventsById[eventId].status === 'assigned' ||
                  eventsById[eventId].status === 'sent'
              )
              .map(eventId => {
                const event = eventsById[eventId]
                event.distance = nearEventIdToDistance[eventId]
                return event
              })
              .sort((a, b) => (a.timestamp < b.timestamp ? -1 : 1))
              .slice(0, 25)
            if (eventsToReturn.length < 25) {
              const oldestEventsFirst = fetchedEvents.sort(
                (a, b) => (a.timestamp < b.timestamp ? -1 : 1)
              )
              let i = 0
              const userLocation = [latitude, longitude]
              while (
                eventsToReturn.length < 25 &&
                i < oldestEventsFirst.length
              ) {
                const currentEvent = oldestEventsFirst[i]
                if (!nearEventIdToDistance[currentEvent.uid]) {
                  const eventLocation = [
                    currentEvent.details.geo.lat,
                    currentEvent.details.geo.lon
                  ]
                  currentEvent.distance = GeoFire.distance(
                    userLocation,
                    eventLocation
                  )
                  eventsToReturn.push(currentEvent)
                }
                i += 1
              }
            }
            resolve(eventsToReturn)
          })
      })
    } catch (error) {
      reject(error)
    }
  })
}

async function fetchLatestOpenedEvents() {
  return new Promise(async (resolve, reject) => {
    try {
      firebase
        .database()
        .ref('events')
        .orderByChild('status')
        .startAt('assigned')
        .endAt('sent')
        .once('value', snapshot => {
          const events = Object.values(snapshot.val() || {})
            .sort((a, b) => (a.timestamp < b.timestamp ? -1 : 1))
            .filter(
              event => event.status === 'assigned' || event.status === 'sent'
            )
            .slice(0, 25)
          resolve(events)
        })
    } catch (error) {
      reject(error)
    }
  })
}

export async function loadLatestOpenEvents(userId) {
  let fetchedEvents
  const hasLocationPermission = await phonePermissionsHandler.getLocationPermission()
  if (hasLocationPermission) {
    try {
      fetchedEvents = await fetchLatestOpenEventsLocationBased(userId)
    } catch (error) {
      // User has given permissions but disabled temporary location or location is unavailable
      fetchedEvents = await fetchLatestOpenedEvents()
    }
  } else {
    fetchedEvents = await fetchLatestOpenedEvents()
  }

  const events = fetchedEvents.map(childSnapshot =>
    eventSnapshotToJSON(childSnapshot)
  )
  return events
}

export function subscribeToEvent(eventKey, onChangeCallback) {
  const callback = snapshot => {
    if (snapshot && snapshot.val()) {
      onChangeCallback(eventSnapshotToJSON(snapshot.val()))
    }
  }

  firebase
    .database()
    .ref(`events/${eventKey}`)
    .on('value', callback)

  // Return callback used which the id for unsubscribing
  return callback
}

export function unsubscribeToEvent(eventKey, callback) {
  firebase
    .database()
    .ref(`events/${eventKey}`)
    .off('value', callback)
}

export async function acceptEvent(eventKey, userKey) {
  const { committed } = await firebase
    .database()
    .ref(`events/${eventKey}`)
    .transaction(eventData => {
      const { status } = eventData
      if (status === 'submitted' || status === 'sent') {
        // Assign event to user
        return {
          ...eventData,
          status: 'assigned',
          assignedTo: userKey
        }
      }
      // Event is taken, return undefined
      return undefined
    })

  if (!committed) {
    throw { code: 'event-taken' } // eslint-disable-line
  }

  // Event was took successful, update volunteer side, don't need transactions
  return firebase
    .database()
    .ref(`volunteer/${userKey}`)
    .update({
      EventKey: eventKey
    })
}

export const acknowledgeReceivedEvent = async (eventId, userId) =>
  firebase
    .database()
    .ref(`events/${eventId}/notifications/volunteers/sent`)
    .update({
      [userId]: true
    })

export async function finaliseEvent(eventKey, userKey) {
  // Update event to completed and make user free again
  const updates = {
    [`events/${eventKey}/status`]: 'completed',
    [`volunteer/${userKey}/EventKey`]: null
  }

  return firebase
    .database()
    .ref()
    .update(updates)
}

export async function unacceptEvent(eventKey, userKey) {
  // Update event to submitted, feedback and make user free again
  const updates = {
    [`events/${eventKey}/status`]: 'submitted',
    [`events/${eventKey}/assignedTo`]: null,
    [`volunteer/${userKey}/EventKey`]: null
  }

  return firebase
    .database()
    .ref()
    .update(updates)
}

export async function fetchDispatcher(dispatcherId) {
  const snapshot = await firebase
    .database()
    .ref(`dispatchers/${dispatcherId}`)
    .once('value')
  const { name, phone } = snapshot.val() || {}
  return { id: snapshot.key, name, phone }
}
