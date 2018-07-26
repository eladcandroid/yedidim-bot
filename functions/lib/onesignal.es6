let rp = require('request-promise')
let { instance, tokens } = require('../config')
const admin = require('firebase-admin')
const GeoFire = require('geofire')
const NOTIFICATION_MUTE_EXPIRATION_MILLIS = 24 * 60 * 60 * 1000

const buildFilters = filter => [
  ...filter,
  // Make filter always targets right environment
  { field: 'tag', key: 'environment', relation: '=', value: instance }
]

const validToken = token =>
  token.length === 36 && !token.startsWith('ExponentPushToken')

const userMutedNotifications = user => {
  if (!user.Muted) {
    return false
  }
  let millisSinceMuted = new Date().getTime() - user.Muted
  return millisSinceMuted < NOTIFICATION_MUTE_EXPIRATION_MILLIS
}

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

export const sendNotificationByOneSignalLocation = async props => {
  console.log(
    '[OneSignal] [OneSignal Location] Sending event notification',
    props
  )
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

export const sendNotificationByGeoFireLocation = async props => {
  console.log(
    '[OneSignal] [Geofire Location] Sending event notification',
    props
  )

  const { title, message, data, appType, radius, latitude, longitude } = props

  return new Promise((resolve, reject) => {
    const usersInRadius = []
    const geoFire = new GeoFire(admin.database().ref('/user_location'))

    const userQueryParams = {
      center: [latitude, longitude],
      radius
    }

    console.log(
      `[sendNotificationByGeoFireLocation] Querying users in location`,
      userQueryParams,
      data
    )

    const geoQuery = geoFire.query(userQueryParams)

    geoQuery.on('key_entered', function(userId) {
      usersInRadius.push(userId)
    })

    geoQuery.on('ready', function() {
      geoQuery.cancel()
      console.log(
        `[sendNotificationByGeoFireLocation] Found ${
          usersInRadius.length
        } in location`,
        usersInRadius,
        data
      )
      admin
        .database()
        .ref('/volunteer')
        .orderByChild('NotificationToken')
        .startAt('')
        .once('value', tokens => {
          if (!tokens.hasChildren()) {
            console.log(
              `[sendNotificationByGeoFireLocation] There are no notification tokens to send to, stopping`,
              data
            )
            return resolve.resolve(400)
          }

          // Listing all tokens.
          const usersById = tokens.val()
          console.log(
            `[sendNotificationByGeoFireLocation] Filtering original users list to validate tokens`,
            Object.keys(usersById),
            data
          )

          const userIds = Object.keys(usersById)
            .filter(
              userId =>
                validToken(usersById[userId].NotificationToken) &&
                usersInRadius.indexOf(userId) > -1 &&
                !userMutedNotifications(usersById[userId])
            )
            .map(userId => usersById[userId].NotificationToken)

          console.log(
            `[sendNotificationByGeoFireLocation] After filter, users list for sending is`,
            userIds,
            data
          )

          sendNotificationByUserIds({ title, message, data, appType, userIds })
            .then(receipts => {
              console.log(
                `[sendNotificationByGeoFireLocation] Finishing sending notifications, receipts are`,
                receipts,
                data
              )

              resolve(userIds)
            })
            .catch(err => {
              console.log(
                `[sendNotificationByGeoFireLocation] Error sending notifications`,
                data,
                err
              )
              reject(err)
            })
        })
    })
  })
}

export const sendNotificationByUserIds = async props => {
  console.log('[OneSignal] Sending event notification', props)
  const { title, message, data, userIds, appType } = props
  // Validate tokens
  let validatedUserIds = userIds.filter(validToken)

  if (validatedUserIds.length !== userIds.length) {
    let invalidIds = userIds.filter(id => validatedUserIds.indexOf(id) === -1)
    console.warn(
      `[OneSignal] Tried sending message to invalid tokens to ${appType}`,
      invalidIds
    )
  }

  if (validatedUserIds.length === 0) {
    console.warn(
      `[OneSignal] No valid tokens were found to send notification, ending without action`,
      userIds,
      validatedUserIds
    )

    return true
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

export const notifyAll = async props => {
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
