exports.handleUpdateEvent = (event,admin) => {
	let eventData = event.data.val();
	let previousValue = event.data.previous.val();

    console.log(' new is ' + eventData.status, 'event data ', eventData);
    console.log(eventData);

	if (!haveToSendNotification(eventData, previousValue)) {
		console.log('block',eventData.status,previousValue.status);
		return Promise.resolve('blocked');
	}

	// Get the list of device notification tokens.
	const getDeviceTokensPromise = admin
		.database()
		.ref('/volunteer')
		.orderByChild('FCMToken')
		.startAt('')
		.once('value');

	// Get the follower profile.

	return Promise.resolve(getDeviceTokensPromise).then(tokens => {
		// Check if there are any device tokens.
		if (!tokens.hasChildren()) {
			console.log('There are no notification tokens to send to.');
			return;
		}

		console.log('There are', tokens.numChildren(), 'tokens to send notifications to.');

		// Notification details.
		const payload = {
			data: {
				event: JSON.stringify(eventData)
			}
		};

		console.log(tokens.val());
		// Listing all tokens.
		let tokenData = tokens.val();
		const tokensToSend = Object.keys(tokenData).filter(t => tokenData[t].FCMToken && tokenData[t].FCMToken.length > 3).map(function(t) {
			return tokenData[t].FCMToken;
		});

		console.log(tokensToSend);

		// Send notifications to all tokens.
		return admin
			.messaging()
			.sendToDevice(tokensToSend, payload)
			.then(response => {
				// For each message check if there was an error.
				//const tokensToRemove = [];
				response.results.forEach((result, index) => {
					const error = result.error;
					if (error) {
						console.error('Failure sending notification to', tokensToSend[index], error);
						// Cleanup the tokens who are not registered anymore.
						if (
							error.code === 'messaging/invalid-registration-token' ||
							error.code === 'messaging/registration-token-not-registered'
						) {
							//tokensToRemove.push(tokensSnapshot.ref.child(tokens[index]).remove());
						}
					}
				});
				//return Promise.all(tokensToRemove);
			});
	});
};

function haveToSendNotification(eventData, previousValue){
	return eventData.status === 'sent' || (previousValue === null  || previousValue.status !== 'sent');
}