const admin = require('firebase-admin')
const GeoFire = require('geofire')
const { sendPushNotifications } = require('./onesignal')
const { sendEmailNotifications } = require('./email')
const NOTIFICATION_MUTE_EXPIRATION_MILLIS = 24 * 60 * 60 * 1000
import logger from './logger'

const validToken = token =>
  token.length === 36 && !token.startsWith('ExponentPushToken')

const userMutedNotifications = user => {
  if (!user.Muted) {
    return false
  }
  let millisSinceMuted = new Date().getTime() - user.Muted
  return millisSinceMuted < NOTIFICATION_MUTE_EXPIRATION_MILLIS
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

      // Extract userIds from 'userId-locationId' entries
      // And remove duplicated using set
      const uniqueUserIdsInRadius = [
        ...new Set(usersInRadius.map(userId => userId.split('-')[0]))
      ]

      console.log(
        `[sendNotificationByGeoFireLocation] Found unique userIds ${
          uniqueUserIdsInRadius.length
        } in location`,
        uniqueUserIdsInRadius,
        data
      )

      // Logging found users for location
      logger.track(
        uniqueUserIdsInRadius.map(userId => ({
          eventType: 'event notification by radius (search)', // required
          userId,
          eventProperties: {
            origin: 'server',
            event: {
              id: data.eventId,
              latitude,
              longitude
            },
            radius
          }
        }))
      )

      admin
        .database()
        .ref('/volunteer')
        .once('value', allVolunteers => {
          if (!allVolunteers.hasChildren()) {
            console.log(
              `[sendNotificationByGeoFireLocation] No volunteers found, stopping`,
              data
            )
            return resolve.resolve(400)
          }

          // Listing all tokens.
          const usersById = allVolunteers.val()

          const users = Object.keys(usersById)
            .filter(
              userId =>
                uniqueUserIdsInRadius.indexOf(userId) > -1 &&
                !userMutedNotifications(usersById[userId])
            )
            .map(userId => ({ userId, ...usersById[userId] }))

          console.log(
            `[sendNotificationByGeoFireLocation] After filter by location, users list for sending notification is`,
            users.map(({ MobilePhone }) => MobilePhone),
            data
          )

          logger.track(
            users.map(({ userId }) => ({
              eventType: 'event notification by radius (send)', // required
              userId,
              eventProperties: {
                origin: 'server',
                event: {
                  id: data.eventId,
                  latitude,
                  longitude
                },
                radius
              }
            }))
          )

          sendNotificationToUsers({ title, message, data, appType, users })
            .then(receipts => {
              console.log(
                `[sendNotificationByGeoFireLocation] Finishing sending notifications, receipts are`,
                receipts,
                data
              )

              resolve(users.map(({ MobilePhone }) => MobilePhone))
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

export const sendNotificationToUsers = async props => {
  console.log('[OneSignal] Sending event notification', props)
  const { title, message, data, users, appType } = props

  const userIds = users
    .map(({ token, NotificationToken }) => token || NotificationToken)
    .filter(token => !!token)

  const emails = users
    .map(({ notificationEmail }) => notificationEmail)
    .filter(emails => !!emails)

  // Validate tokens
  let validatedUserIds = userIds.filter(validToken)

  if (validatedUserIds.length !== userIds.length) {
    let invalidIds = userIds.filter(id => validatedUserIds.indexOf(id) === -1)
    console.warn(
      `[Notifications:Push] Tried sending message to invalid tokens to ${appType}`,
      invalidIds
    )
  }

  const results = []

  if (validatedUserIds && validatedUserIds.length) {
    results.push(
      sendPushNotifications({
        include_player_ids: validatedUserIds,
        title,
        message,
        data,
        appType
      })
    )
  } else {
    console.warn(
      `[Notifications:Push] No valid tokens were found to send notification, ending without action`,
      userIds,
      validatedUserIds
    )
    results.push(Promise.resolve('No push notifications to send'))
  }

  if (emails && emails.length) {
    results.push(
      sendEmailNotifications({
        emails,
        title,
        message,
        data,
        appType
      })
    )
  } else {
    console.warn(
      `[Notifications:Email] No emails were found to send notification, ending without action`,
      emails
    )
    results.push(Promise.resolve('No emails notifications to send'))
  }

  const promises = Promise.all(results)

  console.log(
    `[Notifications] End sending notifications`,
    props,
    await promises
  )

  return promises
}
