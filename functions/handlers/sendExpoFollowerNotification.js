const Expo = require('expo-server-sdk');
const Consts = require('./consts');
const notificationHelper = require('./notificationHelper');
// Create a new Expo SDK client
let expo = new Expo();

exports.handleUpdateEvent = (event, admin) => {
	let eventData = event.data.val();
	let previousValue = event.data.previous.val();

    console.log(' new is ' + eventData.status, 'event data ', eventData);

	if (!notificationHelper.haveToSendNotification(eventData, previousValue)) {
		console.log('block',eventData.status,previousValue.status);
		return Promise.resolve('blocked');
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
			console.log('There are no notification tokens to send to.');
			return Promise.resolve(400);
        }

        console.log('There are', tokens.numChildren(), 'tokens to send notifications to.');

		// Listing all tokens.
        let tokenData = tokens.val();
        const dataToSend = Object.keys(tokenData).filter(f => Expo.isExpoPushToken(tokenData[f].NotificationToken)).map(function(t) {
            let objectToSend = {};
            objectToSend.to = tokenData[t].NotificationToken;
            objectToSend.data = {
                key: eventData.key
            };
            objectToSend.title = 'ידידים - קריאה חדשה';
            objectToSend.body = notificationHelper.formatNotification(eventData);
            objectToSend.sound = 'default';
            return objectToSend;
		});
		
		console.log('after filter their are', dataToSend.length, 'tokens to send notifications to.');

        let chunks = expo.chunkPushNotifications(dataToSend);
		let promises = [];

		for (let chunk of chunks) {
			promises.push(new Promise(resolve => {
			  expo.sendPushNotificationsAsync(chunk)
				.then(receipts => {
				  console.log("Successfully sent notifications : \n", receipts);
				  resolve();
				})
				.catch(err => {
				  console.error("Failed to send notifications : \n", err);
				  resolve();
				});
			}));
		  }
		  return Promise.all(promises).then(() => {
			  console.log('finish');
			});
    });
};


