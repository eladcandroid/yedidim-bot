let rp = require('request-promise')
let { tokens } = require('../config')

export const sendPushNotifications = async ({
  title,
  message,
  appType,
  ...other
}) => {
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
