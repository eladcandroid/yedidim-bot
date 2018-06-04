const geoHelper = require('./geoHelper');

exports.indexEventGeoLocation = (eventId, change, admin) => {
	const eventData = change.after.val();
	if (!eventData){
    return Promise.resolve();
  }
	if (!change.before.exists()){
		return geoHelper.saveLocation("event_location", admin, eventId,  [parseFloat(eventData.details.geo.lat),
			parseFloat(eventData.details.geo.lon)]);
  } else {
		return Promise.resolve();
	}
};
