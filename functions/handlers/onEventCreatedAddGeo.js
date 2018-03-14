const geoHelper = require('./geoHelper');

exports.indexEventGeoLocation = (event,admin) => {
	const eventData = event.data.val();
	if (!eventData){
    return Promise.resolve();
  }
	if (!event.data.previous.exists()){
		return geoHelper.saveLocation("event_location", admin, eventData.key,  [parseFloat(eventData.details.geo.lat), 
			parseFloat(eventData.details.geo.lon)]);
  } else {
		return Promise.resolve();
	}
};
