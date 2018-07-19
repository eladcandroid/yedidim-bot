let rp = require('request-promise')
let { instance, tokens } = require('../config')

const buildFilters = filter => [
  ...filter,
  // Make filter always targets right environment
  { field: 'tag', key: 'environment', relation: '=', value: instance }
]

const sendNotifications = async ({ title, message, appType, ...other }) => {
  console.log('Using tokens ', tokens)
  return rp({
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: `Basic ${tokens.oneSignal[appType].RestApiToken}`
    },
    uri: 'https://onesignal.com/api/v1/notifications',
    body: {
      app_id: tokens.oneSignal[appType].AppId,
      headings: { en: title },
      contents: { en: message },
      ios_sound: 'notification.caf',
      android_sound: 'notification',
      ...other
    },
    json: true // Automatically stringifies the body to JSON
  })
}

const sendNotificationByLocation = async props => {
  console.log('[OneSignal] Sending event notification', props)
  const { title, message, data, appType } = props
  try {
    let radiusMeters = props.radius * 1000
    const results = await sendNotifications({
      filters: [
        {
          field: 'location',
          radius: radiusMeters,
          lat: props.latitude,
          long: props.longitude
        }
      ],
      title,
      message,
      data,
      appType
    })
    console.log('[OneSignal] Success event notifications', results)
    return results
  } catch (error) {
    console.log('[OneSignal] Fail event notifications', error)
    throw error
  }
}

const sendNotificationByUserIds = async props => {
  console.log('[OneSignal] Sending event notification', props)
  const { title, message, data, userIds, appType } = props
  let validatedUserIds = userIds.filter(
    id => id.length === 36 && !id.startsWith('ExponentPushToken')
  )
  if (validatedUserIds.length !== userIds.length) {
    let invalidIds = userIds.filter(id => validatedUserIds.indexOf(id) === -1)
    console.warn(
      `[OneSignal]  Tried sending message to invalid tokens to ${appType}`,
      invalidIds
    )
  }
  try {
    const results = await sendNotifications({
      include_player_ids: validatedUserIds,
      title,
      message,
      data,
      appType
    })
    console.log('[OneSignal] Success test notifications', results)
    return results
  } catch (error) {
    console.log('[OneSignal] Fail test notifications', error)
    throw error
  }
}

const notifyAll = async props => {
  console.log('[OneSignal] Sending event notification', props)
  const { title, message, data, appType } = props
  try {
    const results = await sendNotifications({
      included_segments: ['All'],
      title,
      message,
      data,
      appType
    })
    console.log('[OneSignal] Success event notifications', results)
    return results
  } catch (error) {
    console.log('[OneSignal] Fail event notifications', error)
    throw error
  }
}

module.exports = {
  sendNotificationByLocation,
  sendNotificationByUserIds,
  notifyAll
}
