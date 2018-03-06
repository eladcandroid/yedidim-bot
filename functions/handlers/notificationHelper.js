const Consts = require('./consts');


exports.formatNotification = (eventData) => {
    const data = ` ${Consts.EventCases[eventData.details.case]} ב${eventData.details.street_name} ${eventData.details.street_number} ${eventData.details.city}. סוג רכב ${eventData.details["car type"]} לחץ לפרטים`;
	console.log(data);
	return data;
};

exports.haveToSendNotification = (eventData, previousValue) => {
    	return eventData.status === 'sent' && (previousValue === null  || previousValue.status !== 'sent');
}

