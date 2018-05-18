import rp from 'request-promise'
import { instance } from '../config'

const ONE_SIGNAL_REST_API_KEY =
  'OTgxNmJiYTItM2U0Ni00MzAzLWEyMjEtZWVmYWVkZTg3ZGUz'
const ONE_SIGNAL_APP_ID = '2ee2bdaa-39dc-4667-99d6-e66e81af79ba'

const buildFilters = filter => [
  ...filter,
  // Make filter always targets right environment
  { field: 'tag', key: 'environment', relation: '=', value: instance }
]

const sendNotifications = async ({ title, message, ...other }) =>
  rp({
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: `Basic ${ONE_SIGNAL_REST_API_KEY}`
    },
    uri: 'https://onesignal.com/api/v1/notifications',
    body: {
      app_id: ONE_SIGNAL_APP_ID,
      headings: { en: title },
      contents: { en: message },
      ...other
    },
    json: true // Automatically stringifies the body to JSON
  })

export const notifyEvent = async props => {
  console.log('[OneSignal] Sending event notification', props)
  const { userType, address, eventId } = props
  try {
    const results = await sendNotifications({
      // TODO support handleBot
      filters: buildFilters([
        { field: 'tag', key: `is_${userType}`, relation: '=', value: 'true' }
      ]),
      title: 'נפתח ארוע חדש',
      message: 'ארוע ב ' + address,
      data: {
        eventId,
        type: 'event'
      }
    })
    console.log('[OneSignal] Success event notifications', results)
    return results
  } catch (error) {
    console.log('[OneSignal] Fail event notifications', error)
    throw error
  }
}

export const notifyTest = async props => {
  console.log('[OneSignal] Sending test notifications', props)
  const { userId } = props
  // if userId is set then send to specific user
  // if not, then send to all users
  try {
    const results = await sendNotifications({
      filters: userId ? undefined : buildFilters([]),
      include_player_ids: userId ? [userId] : undefined,
      title: 'בדיקת התראות לישום',
      message: 'נא לפתוח התראה הזאת כדי לאשר קבלה. לא מדובר באירוע.',
      data: {
        userId,
        type: 'test'
      }
    })
    console.log('[OneSignal] Success test notifications', results)
    return results
  } catch (error) {
    console.log('[OneSignal] Fail test notifications', error)
    throw error
  }
}
