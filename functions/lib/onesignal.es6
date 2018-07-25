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

  return new Promise((resolve, reject) => {
    let usersInRadius = []
    let geoFire = new GeoFire(admin.database().ref('/user_location'))

    const userQueryParams = {
      center: [eventData.details.geo.lat, eventData.details.geo.lon],
      radius: searchRadius || Consts.NOTIFICATION_SEARCH_RADIUS_KM
    }

    console.log(
      `[sendNotificationToCloseByVolunteers] Querying users in location`,
      userQueryParams,
      eventData.key
    )

    let geoQuery = geoFire.query(userQueryParams)

    geoQuery.on('key_entered', function(userId) {
      usersInRadius.push(userId)
    })

    geoQuery.on('ready', function() {
      geoQuery.cancel()
      console.log(
        `[sendNotificationToCloseByVolunteers] Found ${
          usersInRadius.length
        } in location`,
        usersInRadius,
        eventData.key
      )
      admin
        .database()
        .ref('/volunteer')
        .orderByChild('NotificationToken')
        .startAt('')
        .once('value', tokens => {
          if (!tokens.hasChildren()) {
            console.log(
              `[sendNotificationToCloseByVolunteers] There are no notification tokens to send to, stopping`,
              eventData.key
            )
            return resolve.resolve(400)
          }

          // Listing all tokens.
          let usersById = tokens.val()
          console.log(
            `[sendNotificationToCloseByVolunteers] Filtering original users list to validate tokens`,
            Object.keys(usersById),
            eventData.key
          )

          let recipients = Object.keys(usersById).filter(
            userId =>
              Expo.isExpoPushToken(usersById[userId].NotificationToken) &&
              usersInRadius.indexOf(userId) > -1 &&
              !userMutedNotifications(usersById[userId])
          )

          console.log(
            `[sendNotificationToCloseByVolunteers] After filter, users list for sending is`,
            recipients,
            eventData.key
          )

          const notifications = recipients.map(function(userId) {
            let token = usersById[userId].NotificationToken
            return buildEventNotification(eventData, notificationTitle, token)
          })

          sendNotifications(notifications)
            .then(receipts => {
              console.log(
                `[sendNotificationToCloseByVolunteers] Finishing sending notifications, receipts are`,
                receipts[0],
                eventData.key
              )

              // Save status of notifications for the event
              updateEventNotificationStatus(
                admin,
                eventData.key,
                recipients.filter(
                  (recipient, idx) => receipts[0][idx].status === 'ok'
                ),
                recipients.filter(
                  (recipient, idx) => receipts[0][idx].status === 'error'
                )
              ).then(() => {
                resolve(recipients)
              })
            })
            .catch(err => {
              console.log(
                `[sendNotificationToCloseByVolunteers] Error sending notifications`,
                eventData.key,
                err
              )
              reject(err)
            })
        })
    })
  })
  // const { title, message, data, appType } = props
  // try {
  //   let radiusMeters = props.radius * 1000
  //   const results = await sendNotifications({
  //     filters: [
  //       {
  //         field: 'location',
  //         radius: radiusMeters,
  //         lat: props.latitude,
  //         long: props.longitude
  //       }
  //     ],
  //     title,
  //     message,
  //     data,
  //     appType
  //   })
  //   console.log('[OneSignal] Success event notifications', results)
  //   return results
  // } catch (error) {
  //   console.log('[OneSignal] Fail event notifications', error)
  //   throw error
  // }
}

export const sendNotificationByUserIds = async props => {
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
