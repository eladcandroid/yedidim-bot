const geoHelper = require('./geoHelper')

exports.indexEventGeoLocation = (event, admin, eventId) => {
  const eventData = event.data.val()
  if (!eventData) {
    console.log('[onEventCreateAddGeo] No event data, returning', eventId)
    return Promise.resolve()
  }
  if (!event.data.previous.exists()) {
    console.log(
      '[onEventCreateAddGeo] Event is new, indexing new event location',
      eventData.details.geo,
      eventId
    )
    return geoHelper.saveLocation('event_location', admin, eventData.key, [
      parseFloat(eventData.details.geo.lat),
      parseFloat(eventData.details.geo.lon)
    ])
  } else {
    console.log(
      "[onEventCreateAddGeo] Event is not new, don't need to index",
      eventData.details.geo,
      eventId
    )
    return Promise.resolve()
  }
}
