import { firebaseFunctionsUrl } from 'config'
import firebase from 'firebase'

export const sendTestNotification = async (userId, role) => {
  const response = await fetch(
    `${firebaseFunctionsUrl()}/sendTestNotification`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId,
        role
      })
    }
  )

  if (response.status === 200) {
    return true
  }

  const errorMessage = await response.text()
  throw new Error(errorMessage)
}

export const acknowledgeTestNotification = async userId =>
  firebase
    .database()
    .ref(`/volunteer/${userId}`)
    .update({
      NotificationStatus: 'working',
      NotificationStatusTimestamp: new Date().getTime()
    })
