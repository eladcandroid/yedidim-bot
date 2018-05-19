let rp = require('request-promise')
let {instance} = require('../config')

const credentials = {
  "dispatchers": {
    "RestApiToken": "NTA4NjZlMjEtZmZkNi00ZjQ4LWE0NDAtMDgyNGVhNGJiMGMw",
    "AppId": "9177d83e-8dc2-4501-aef8-c18697ca6f27"
  },
  "volunteers": {
    "RestApiToken": "NDE4NmE2NjQtY2E3Mi00YmFjLTlkYzktODEzYmJiZDY4OWZk",
    "AppId": "e5ef1cdc-a50b-430f-8fac-b7702740c59a"
  }
}

const buildFilters = filter => [
  ...filter,
  // Make filter always targets right environment
  {field: 'tag', key: 'environment', relation: '=', value: instance}
]

const sendNotifications = async ({title, message, appType, ...other}) => {
  return rp({
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: `Basic ${credentials[appType].RestApiToken}`
    },
    uri: 'https://onesignal.com/api/v1/notifications',
    body: {
      app_id: credentials[appType].AppId,
      headings: {en: title},
      contents: {en: message},
      ...other
    },
    json: true // Automatically stringifies the body to JSON
  })
}

const sendNotificationByLocation = async (props) => {
  console.log('[OneSignal] Sending event notification', props)
  const {title, message, data, appType} = props
  try {
    let radiusMeters = props.radius * 1000;
    const results = await sendNotifications({
      filters: [
        {"field": "location", "radius": radiusMeters, lat: props.latitude, long: props.longitude}
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

const sendNotificationByUserIds = async (props) => {
  console.log('[OneSignal] Sending event notification', props)
  const {title, message, data, userIds, appType} = props
  try {
    const results = await sendNotifications({
      include_player_ids: userIds,
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

const notifyAll = async (props) => {
  console.log('[OneSignal] Sending event notification', props)
  const {title, message, data, appType} = props
  try {
    const results = await sendNotifications({
      included_segments: ["All"],
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

module.exports = {sendNotificationByLocation, sendNotificationByUserIds, notifyAll}


