const geoHelper = require('./geoHelper')

exports.indexEventGeoLocation = (event, admin, eventId) => {
  const eventData = event.data.val()

  if (!eventData) {
    console.log('[onEventCreateAddGeo] No event data, returning', eventId)
    return Promise.resolve()
  }
  if (
    eventData.details.geo &&
    (!event.data.previous.exists() || !event.data.previous.val().details.geo)
  ) {
    console.log(
      '[onEventCreateAddGeo] Event geolocation is new, indexing location',
      eventData.details.geo,
      eventId
    )
    return geoHelper.saveLocation('event_location', admin, eventData.key, [
      parseFloat(eventData.details.geo.lat),
      parseFloat(eventData.details.geo.lon)
    ])
  } else {
    console.log(
      "[onEventCreateAddGeo] Event geolocation not set or not new, don't need to index",
      eventData.details.geo,
      eventId
    )
    return Promise.resolve()
  }
}
