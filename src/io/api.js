import firebase from 'firebase'
import { Permissions, Notifications } from 'expo'

async function registerForPushNotificationsAsync() {
  const { status: existingStatus } = await Permissions.getAsync(
    Permissions.NOTIFICATIONS
  )
  let finalStatus = existingStatus

  // only ask if permissions have not already been determined, because
  // iOS won't necessarily prompt the user a second time.
  if (existingStatus !== 'granted') {
    // Android remote notification permissions are granted during the app
    // install, so this will only ask on iOS
    const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS)
    finalStatus = status
  }

  // Stop here if the user did not grant permissions
  if (finalStatus !== 'granted') {
    throw {
      code: 'Notification not granted',
      message: 'User did not granted notification permissions'
    }
  }

  // Get the token that uniquely identifies this device
  return Notifications.getExpoPushTokenAsync()
}

export async function updateUser(userKey, properties) {
  return firebase
    .database()
    .ref(`/volunteer/${userKey}`)
    .update(properties)
}

async function loadUserInfo(userAuth) {
  if (!userAuth) {
    return undefined
  }

  const snapshot = await firebase
    .database()
    .ref(`/volunteer/${userAuth.phoneNumber}`)
    .once('value')

  if (snapshot.val()) {
    return snapshot.val()
  }

  /* eslint no-throw-literal: "off" */
  throw 'volunteer-not-registered'
}

async function updateUserNotificationToken(userAuth) {
  const NotificationToken = await registerForPushNotificationsAsync()

  return firebase
    .database()
    .ref(`/volunteer/${userAuth.phoneNumber}`)
    .update({ NotificationToken })
}

export function onAuthenticationChanged(onAuthenticationCallback, onError) {
  return firebase.auth().onAuthStateChanged(async userAuth => {
    try {
      const userInfo = await loadUserInfo(userAuth)
      onAuthenticationCallback({ userInfo, userAuth })
    } catch (e) {
      onError(e)
    }
  })
}

export async function signIn({ verificationId, code }) {
  try {
    const userAuth = await firebase
      .auth()
      .signInWithCredential(
        firebase.auth.PhoneAuthProvider.credential(verificationId, code)
      )

    // Update notification token after sign in
    await updateUserNotificationToken(userAuth)

    const userInfo = await loadUserInfo(userAuth)

    return { userInfo, userAuth }
  } catch (error) {
    throw error.code
  }
}

export async function signOut() {
  return firebase.auth().signOut()
}

const eventSnapshotToJSON = snapshot => ({
  guid: snapshot.key,
  status: snapshot.status,
  assignedTo: snapshot.assignedTo,
  timestamp: snapshot.timestamp,
  address: snapshot.details.address,
  caller: snapshot.details['caller name'],
  carType: snapshot.details['car type'],
  type: snapshot.details.case,
  city: snapshot.details.city,
  fullAddress: snapshot.details.full_address,
  lat: snapshot.details.geo.lat,
  lon: snapshot.details.geo.lon,
  more: snapshot.details.more,
  phone: snapshot.details['phone number'],
  streetName: snapshot.details.street_name,
  streetNumber: snapshot.details.street_number
})

export function subscribeToEvent(eventKey, onChangeCallback) {
  const callback = snapshot => {
    if (snapshot) {
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
    throw { code: 'event-taken' }
  }

  // Event was took successful, update volunteer side, don't need transactions
  return firebase
    .database()
    .ref(`volunteer/${userKey}`)
    .update({
      EventKey: eventKey
    })
}

export async function finaliseEvent(eventKey, userKey, feedback) {
  // Update event to completed and make user free again
  const updates = {
    [`events/${eventKey}/status`]: 'completed',
    [`events/${eventKey}/feedback`]: feedback,
    [`volunteer/${userKey}/EventKey`]: null
  }

  return firebase
    .database()
    .ref()
    .update(updates)
}

export async function unacceptEvent(eventKey, userKey, feedback) {
  // Update event to submitted, feedback and make user free again
  const updates = {
    [`events/${eventKey}/status`]: 'submitted',
    [`events/${eventKey}/assignedTo`]: null,
    [`events/${eventKey}/unaccepted`]: {
      feedback,
      userKey
    },
    [`volunteer/${userKey}/EventKey`]: null
  }

  return firebase
    .database()
    .ref()
    .update(updates)
}
