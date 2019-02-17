import * as geoHelper from './geoHelper'
import logger from '../lib/logger'
const values = require('object.values')

exports.loadLatestOpenEvents = async (req, res, admin) => {
  console.log('[LatestOpenEvents]', req.query)

  try {
    const coords = ['latitude', 'longitude'].map(props =>
      req.query[props] ? parseFloat(req.query[props]) : undefined
    )

    const decodedToken = await admin.auth().verifyIdToken(req.query.authToken)
    const authToken = decodedToken.phone_number

    console.log('[LatestOpenEvents]', authToken, coords)

    if (coords[0] && coords[1]) {
      // Save user location
      await geoHelper.saveLocation('user_location', admin, authToken, coords)

      // TODO Code with retrieving by location
    } else {
      // TODO Code without location
    }

    const snapshot = await admin
      .database()
      .ref('events')
      .orderByChild('isOpen')
      .equalTo(true)
      .once('value')

    // Shim for Object.values (not in node6)
    const events = values(snapshot.val() || {})
      .sort((a, b) => (a.timestamp < b.timestamp ? -1 : 1))
      .filter(event => event.status === 'assigned' || event.status === 'sent')
      .slice(0, 25)

    logger.track({
      eventType: 'retrieve latest events', // required
      userId: authToken,
      eventProperties: {
        origin: 'server',
        latitude: coords[0],
        longitude: coords[1]
      }
    })

    res.status(200).send(events)
  } catch (error) {
    console.log('[LatestOpenEvents] Error', error)
    res.status(500).send(error.message)
  }
}
