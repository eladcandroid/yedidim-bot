import { firebaseFunctionsUrl } from '../config'

export default async function sendTestNotification(userId) {
  fetch(`${firebaseFunctionsUrl()}/sendVolunteerTestNotification`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      phone: userId
    })
  })
    .then(() => {
      console.log('Success')
    })
    .catch(() => {
      console.log('error')
    })
}
