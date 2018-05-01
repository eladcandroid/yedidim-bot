import { firebaseFunctionsUrl } from 'config'
import firebase from 'firebase'

export const sendTestNotification = async (userId, role) =>
  fetch(`${firebaseFunctionsUrl()}/sendVolunteerTestNotification`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      userId,
      role
    })
  })

export const acknowledgeTestNotification = async userId =>
  firebase
    .database()
    .ref(`/volunteer/${userId}`)
    .update({
      NotificationStatus: 'working',
      NotificationStatusTimestamp: new Date().getTime()
    })
