import * as geoHelper from './geoHelper'
import logger from '../lib/logger'

exports.loadLatestOpenEvents = async (req, res, admin) => {
  console.log('[LatestOpenEvents]', req.params)

  try {
    const { latitude, longitude } = req.params

    const decodedToken = await admin.auth().verifyIdToken(req.params.authToken)
    const authToken = decodedToken.phone_number

    console.log('[LatestOpenEvents]', authToken, latitude, longitude)

    // Save user location
    await geoHelper.saveLocation('user_location', admin, authToken, [
      latitude,
      longitude
    ])

    const snapshot = await firebase
      .database()
      .ref('events')
      .orderByChild('status')
      .startAt('assigned')
      .endAt('sent')
      .once('value')

    const events = Object.values(snapshot.val() || {})
      .sort((a, b) => (a.timestamp < b.timestamp ? -1 : 1))
      .filter(event => event.status === 'assigned' || event.status === 'sent')
      .slice(0, 25)

    logger.track({
      eventType: 'retrieve latest events', // required
      userId: authToken,
      eventProperties: {
        origin: 'server',
        latitude,
        longitude
      }
    })

    res.status(200).send(events)
  } catch (error) {
    console.log('[LatestOpenEvents] Error', error)
    res.status(500).send(error.message)
  }
}
