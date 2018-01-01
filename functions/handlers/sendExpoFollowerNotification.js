const Expo = require('expo-server-sdk');

// Create a new Expo SDK client
let expo = new Expo();

exports.handleUpdateEvent = (event, admin) => {
    let eventData = event.data.val();
    console.log(' new is ' + eventData.status, 'event data ', eventData);
    console.log(eventData);

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
            objectToSend.data = {
                key: eventData.key
            };
            objectToSend.title = 'yedidim title';
            objectToSend.body = eventData;
            objectToSend.sound = 'default';
            return objectToSend;
        });

        let chunks = expo.chunkPushNotifications(dataToSend);
		let promises = [];

		for (let chunk of chunks) {
			promises.push(new Promise(resolve => {
			  expo.sendPushNotificationsAsync(chunk)
				.then(receipts => {
				  console.log("Successfully sent notifications : \n", receipts);
				})
				.catch(err => {
				  console.error("Failed to send notifications : \n", err);
				});
			}));
		  }
		  return Promise.all(promises).then(() => {
			  console.log('finish');
			});
    });
};