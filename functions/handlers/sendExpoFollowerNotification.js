// TODO: use expo sdk
const rp = require('request-promise');

exports.handleUpdateEvent = (event, admin) => {
	let eventData = event.data.val();
	let previousValue = event.data.previous.val();
	console.log('old is ' + previousValue.status + ' new is ' + eventData.status, 'event data ', eventData);
	console.log(eventData);

	if (eventData.status !== 'sent' || previousValue.status === 'sent') {
		console.log('block',eventData.status,previousValue.status);
		return;
	}

	// Get the list of device notification tokens.
	const getDeviceTokensPromise = admin
		.database()
		.ref('/volunteer')
		.orderByChild('NotificationToken')
		.startAt('')
		.once('value');

	// Get the follower profile.
	return Promise.resolve(getDeviceTokensPromise).then(tokens => {
		// Check if there are any device tokens.
		if (!tokens.hasChildren()) {
			return console.log('There are no notification tokens to send to.');
		}

		console.log('There are', tokens.numChildren(), 'tokens to send notifications to.');

		console.log(tokens.val());
		// Listing all tokens.
		let tokenData = tokens.val();
		const dataToSend = Object.keys(tokenData).map(function(t) {
			let objectToSend = {};
			objectToSend.to = tokenData[t].NotificationToken;
			objectToSend.data = { key: eventData.key };
			objectToSend.title = 'yedidim title';
			objectToSend.body = eventData.details.address;
			objectToSend.sound = 'default';
			return objectToSend;
		});

		console.log(dataToSend);

		let options = {
			method: 'POST',
			uri: 'https://exp.host/--/api/v2/push/send',
			body: dataToSend,
			headers: {
				'Content-Type': 'application/json'
			},
			json: true // Automatically stringifies the body to JSON
		};

		return rp(options)
			.then(function(parsedBody) {
				console.log(parsedBody);
				// POST succeeded...
			})
			.catch(function(err) {
				console.log(err);
				// POST failed...
			});
	});
};
