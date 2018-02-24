const GeoFire = require('geofire');
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
		console.log('blocked',eventData.status);
		return Promise.resolve('blocked');
	}

    return sendNotificationToCloseByVolunteers(admin, eventData, 'ידידים - קריאה חדשה');
};

exports.sendNotificationBySearchRadius = (req, res, admin) => {
    return new Promise((resolve, reject) => {
        let {eventId} = req.body;
        let searchRadius = req.body.searchRadius && parseInt(req.body.searchRadius);
        admin.database().ref('/events/' + eventId)
            .once('value', (snapshot) => {
                let event = snapshot.val();
                if (event) {
                    sendNotificationToCloseByVolunteers(admin, event, 'ידידים - קריאה חדשה', searchRadius)
                        .then(() => {
                            res.status(200).send('');
                            resolve();
                        })
                        .catch(err => {
                            res.status(500).send(err);
                            reject(err);
                        });
                } else {
                    res.status(404).send('Did not find event ' + eventId);
                    reject(new Error('Did not find event ' + eventId));
                }
            });
    });
};

exports.sendNotificationToRecipient = (req, res, admin) => {
    return new Promise((resolve, reject) => {
        let {eventId, recipient} = req.body;
        admin.database().ref('/events/' + eventId)
            .once('value', (snapshot) => {
                let event = snapshot.val();
                if (event) {
                    admin.database().ref('/volunteer/' + recipient).once('value', (snapshot) => {
                        let user = snapshot.val();
                        if (user) {
                            let notification = buildEventNotification(event, 'ידידים - התראה על אירוע', user.NotificationToken);
                            sendNotifications([notification])
                                .then((recipients) => {
                                    res.status(200).send(recipients);
                                    resolve(recipients);
                                })
                                .catch((err) => {
                                    res.status(500).send(err);
                                    reject(err);
                                });
                        } else {
                            let message = 'Did not find recipient ' + recipient;
                            res.status(404).send(message);
                            console.error(message);
                            reject(message);
                        }
                    });
                } else {
                    let message = 'Did not find event ' + eventId;
                    res.status(404).send(message);
                    console.error(message);
                    reject(message);
                }
            });
    });
};

let sendNotificationToCloseByVolunteers = (admin, eventData, notificationTitle, searchRadius) => {
    return new Promise((resolve, reject) => {
        let usersInRadius = [];
        let geoFire = new GeoFire(admin.database().ref('/user_location'));

        let geoQuery = geoFire.query({
            center: [eventData.details.geo.lat, eventData.details.geo.lon],
            radius: searchRadius || Consts.NOTIFICATION_SEARCH_RADIUS_KM
        });

        geoQuery.on("key_entered", function (userId) {
            usersInRadius.push(userId);
        });

        geoQuery.on("ready", function () {
            geoQuery.cancel();
            console.log(`Total of ${usersInRadius.length} in radius.`, usersInRadius);
            admin.database().ref('/volunteer').orderByChild('NotificationToken').startAt('')
                .once('value', (tokens) => {
                    if (!tokens.hasChildren()) {
                        console.log('There are no notification tokens to send to.');
                        return resolve.resolve(400);
                    }

                    // Listing all tokens.
                    let usersById = tokens.val();
                    let recipients = Object.keys(usersById)
                        .filter(id => Expo.isExpoPushToken(usersById[id].NotificationToken)
                            && (usersInRadius.indexOf(id) > -1));
                    const notifications = recipients.map(function (userId) {
                        let token = usersById[userId].NotificationToken;
                        return buildEventNotification(eventData, notificationTitle, token);
                    });
                    console.log('after filter their are', notifications.length, 'tokens to send notifications to.');

                    sendNotifications(notifications)
                        .then(() => resolve(recipients))
                        .catch((err) => {
                            reject(err);
                        });
                });
        });
    });
};

let buildEventNotification = (event, title, recipientToken) => {
    let notification = {};
    notification.to = recipientToken;
    notification.data = {
        key: event.key
    };
    notification.title = title;
    notification.body = notificationHelper.formatNotification(event);
    notification.sound = 'default';
    return notification;
};

let sendNotifications = (notifications) => {
    let chunks = expo.chunkPushNotifications(notifications);

    let promises = [];

    for (let chunk of chunks) {
        promises.push(new Promise((resolve, reject) => {
            expo.sendPushNotificationsAsync(chunk)
                .then(receipts => {
                    console.log("Successfully sent notifications : \n", receipts);
                    resolve();
                })
                .catch(err => {
                    console.error("Failed to send notifications : \n", err);
                    reject(err);
                });
        }));
    }
    return Promise.all(promises);
};

