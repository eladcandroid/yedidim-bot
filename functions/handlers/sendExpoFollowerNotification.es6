const Consts = require('./consts');
const notificationHelper = require('./notificationHelper');
// Create a new Expo SDK client
let NOTIFICATION_MUTE_EXPIRATION_MILLIS = 24 * 60 * 60 * 1000;
const {sendNotificationByUserIds, sendNotificationByLocation} = require('../lib/onesignal')

exports.handleUpdateEvent = (event, admin) => {
  let eventData = event.data.val();
  let previousValue = event.data.previous.val();

  console.log(' new is ' + eventData.status, 'event data ', eventData);

  if (!notificationHelper.haveToSendNotification(eventData, previousValue)) {
    console.log('blocked', eventData.status);
    return Promise.resolve('blocked');
  }

  return sendEventNotificationToCloseByVolunteers(eventData, 'קריאה חדשה');
};

exports.sendNotificationBySearchRadius = async (req, res, admin) => {
  try {
    let {eventId} = req.body;
    let searchRadius = req.body.searchRadius && parseInt(req.body.searchRadius);
    let snapshot = await  admin.database().ref('/events/' + eventId).once('value');
    let event = snapshot.val();
    if (event) {
      await sendEventNotificationToCloseByVolunteers(event, 'קריאה חדשה', searchRadius)
      res.status(200).send('');
    } else {
      res.status(404).send('Did not find event ' + eventId);
    }
  } catch (e) {
    res.status(500).send(e);
  }
};

exports.sendNotificationToRecipient = async (req, res, admin) => {
  try {
    let {eventId, recipient} = req.body;
    let snapshot = await admin.database().ref('/events/' + eventId).once('value');
    let event = snapshot.val();
    if (event) {
      let snapshot = await admin.database().ref('/volunteer/' + recipient).once('value');
      let user = snapshot.val();
      if (user) {
        let title = (user.EventKey === eventId) ? "התראה על אירוע פעיל" : "התראה על אירוע";

        let message = notificationHelper.formatNotification(event);
        let data = {
          eventId: event.key,
          type: 'event'
        }
        await sendNotificationByUserIds({
          title, message, data, appType: "volunteers", userIds: [user.NotificationToken]
        });
      } else {
        let message = 'Did not find recipient ' + recipient;
        res.status(404).send(message);
        console.error(message);
      }
    } else {
      let message = 'Did not find event ' + eventId;
      res.status(404).send(message);
      console.error(message);
    }
  } catch (e) {
    console.error(e);
    res.status(500).send(e);
  }
};

exports.sendDispatcherTestNotification = async (req, res, admin) => {
  try {
    let {dispatcherCode} = req.body;
    let snapshot = await admin.database().ref('/dispatchers/' + dispatcherCode).once('value');
    let token = snapshot.val().token;
    let title = 'בדיקה';
    let message = 'בדיקה';
    let data = {
      type: 'test'
    }
    await sendNotificationByUserIds({
      title, message, data, appType: "dispatchers", userIds: [token]
    })
    res.status(200).send('');
  } catch (e) {
    console.error(e);
    res.error(500).send(e);
  }
};

exports.sendVolunteerTestNotification = async (req, res, admin) => {
  try {
    let {phone} = req.body;
    if (phone.charAt(0) === '0') {
      phone = "+972" + phone.substr(1);
    }
    let snapshot = await admin.database().ref('/volunteer/' + phone).once('value');
    let token = snapshot.val().NotificationToken;
    let title = 'בדיקה';
    let message = 'בדיקה';
    let data = {
      type: 'test'
    }
    await sendNotificationByUserIds({
      title, message, data, appType: "volunteers", userIds: [token]
    })
    res.status(200).send('');
  } catch (e) {
    res.status(500).send(e);
  }
};

let sendEventNotificationToCloseByVolunteers = (eventData, notificationTitle, radius) => {
  let latitude = eventData.details.geo.lat;
  let longitude = eventData.details.geo.lon;
  radius = radius || Consts.NOTIFICATION_SEARCH_RADIUS_KM;

  let title = notificationTitle;
  let message = notificationHelper.formatNotification(eventData);
  let data = {
    eventId: eventData.key,
    type: 'event'
  }

  return sendNotificationByLocation({
    title, message, data, latitude, longitude, radius, appType: "volunteers"
  })
};

let userMutedNotifications = (user) => {
  if (!user.Muted) {
    return false;
  }
  let millisSinceMuted = new Date().getTime() - user.Muted;
  return millisSinceMuted < NOTIFICATION_MUTE_EXPIRATION_MILLIS;
};

