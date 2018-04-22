const GeoFire = require('geofire');
const Expo = require('expo-server-sdk');
const Consts = require('./consts');
const notificationHelper = require('./notificationHelper');
// Create a new Expo SDK client
let expo = new Expo();
let NOTIFICATION_MUTE_EXPIRATION_MILLIS = 24 * 60 * 60 * 1000;

exports.handleUpdateEvent = (event, admin) => {
  let eventData = event.data.val();
  let previousValue = event.data.previous.val();

  console.log(' new is ' + eventData.status, 'event data ', eventData);

  if (!notificationHelper.haveToSendNotification(eventData, previousValue)) {
    console.log('blocked', eventData.status);
    return Promise.resolve('blocked');
  }

  return sendNotificationToCloseByVolunteers(admin, eventData, 'קריאה חדשה');
};

exports.sendNotificationBySearchRadius = (req, res, admin) => {
  return new Promise((resolve, reject) => {
    let {eventId} = req.body;
    let searchRadius = req.body.searchRadius && parseInt(req.body.searchRadius);
    admin.database().ref('/events/' + eventId)
      .once('value', (snapshot) => {
        let event = snapshot.val();
        if (event) {
          sendNotificationToCloseByVolunteers(admin, event, 'קריאה חדשה', searchRadius)
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
              let title = (user.EventKey === eventId) ? "התראה על אירוע פעיל" : "התראה על אירוע";
              let notification = buildEventNotification(event, title, user.NotificationToken);
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

exports.sendDispatcherTestNotification = (req, res, admin) => {
  return new Promise((resolve, reject) => {
    let {dispatcherCode} = req.body;
    admin.database().ref('/dispatchers/' + dispatcherCode).once('value', snapshot => {
      let token = snapshot.val().token;
      let notification = {
        to: token,
        title: 'בדיקה',
        body: 'בדיקה',
        data: {
          type: 'test'
        },
        sound: 'default'
      };

      sendNotifications([notification]).then(response => {
        res.send(response);
        resolve();
      }).catch(err => {
        res.status(500).send(err);
        reject();
      });
    });
  });
};

exports.sendVolunteerTestNotification = (req, res, admin) => {
  return new Promise((resolve, reject) => {
    let {phone} = req.body;
    if (phone.charAt(0) === '0') {
      phone = "+972" + phone.substr(1);
    }
    admin.database().ref('/volunteer/' + phone).once('value', snapshot => {
      let token = snapshot.val().NotificationToken;
      let notification = {
        to: token,
        title: 'בדיקה',
        body: 'בדיקה',
        data: {
          type: 'test'
        },
        sound: 'default'
      };

      sendNotifications([notification]).then(response => {
        res.send(response);
        resolve();
      }).catch(err => {
        res.status(500).send(err);
        reject();
      });
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
            .filter(userId => Expo.isExpoPushToken(usersById[userId].NotificationToken)
              && (usersInRadius.indexOf(userId) > -1)
              && !userMutedNotifications(usersById[userId]));
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
    type: 'event',
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
          resolve(receipts);
        })
        .catch(err => {
          console.error("Failed to send notifications : \n", err);
          reject(err);
        });
    }));
  }
  return Promise.all(promises);
};

let userMutedNotifications = (user) => {
  if (!user.Muted) {
    return false;
  }
  let millisSinceMuted = new Date().getTime() - user.Muted;
  return millisSinceMuted < NOTIFICATION_MUTE_EXPIRATION_MILLIS;
};

