'use strict';

var Consts = require('./consts');
var notificationHelper = require('./notificationHelper');
// Create a new Expo SDK client
var NOTIFICATION_MUTE_EXPIRATION_MILLIS = 24 * 60 * 60 * 1000;

var _require = require('../lib/onesignal'),
    sendNotificationByUserIds = _require.sendNotificationByUserIds,
    sendNotificationByLocation = _require.sendNotificationByLocation;

exports.handleUpdateEvent = function (eventId, change) {
  var eventData = change.after.val();
  var previousValue = change.before.val();
  console.log('Event updated = ', eventData);

  if (!notificationHelper.haveToSendNotification(eventData, previousValue)) {

    console.log('blocked', eventData.status);
    return Promise.resolve('blocked');
  }
  return sendEventNotificationToCloseByVolunteers(eventData, 'קריאה חדשה');
};
exports.sendNotificationBySearchRadius = function (req, res, admin) {
  var eventId, searchRadius, snapshot, event;
  return Promise.resolve().then(function () {
    return Promise.resolve().then(function () {
      eventId = req.body.eventId;
      searchRadius = req.body.searchRadius && parseInt(req.body.searchRadius);
      return admin.database().ref('/events/' + eventId).once('value');
    }).then(function (_resp) {
      snapshot = _resp;
      event = snapshot.val();
      return sendEventNotificationToCloseByVolunteers(event, 'קריאה חדשה', searchRadius);
    }).then(function () {
      if (event) {
        res.status(200).send('');
      } else {
        res.status(404).send('Did not find event ' + eventId);
      }
    }).catch(function (e) {
      res.status(500).send(e);
    });
  }).then(function () {});
};
exports.sendNotificationToRecipient = function (req, res, admin) {
  var _req$body, eventId, recipient, snapshot, event, _snapshot, user, title, message, data, _message, _message2, _test;

  return Promise.resolve().then(function () {
    return Promise.resolve().then(function () {
      _req$body = req.body;
      eventId = _req$body.eventId;
      recipient = _req$body.recipient;
      return admin.database().ref('/events/' + eventId).once('value');
    }).then(function (_resp) {
      snapshot = _resp;
      event = snapshot.val();
      _test = event;
      return admin.database().ref('/volunteer/' + recipient).once('value');
    }).then(function (_resp) {
      if (_test) {
        _snapshot = _resp;
        user = _snapshot.val();
      }

      return sendNotificationByUserIds({
        title: title, message: message, data: data, appType: "volunteers", userIds: [user.NotificationToken]
      });
    }).then(function () {
      if (_test && user) {
        title = user.EventKey === eventId ? "התראה על אירוע פעיל" : "התראה על אירוע";
        message = notificationHelper.formatNotification(event);
        data = {
          eventId: event.key,
          type: 'event'
        };
      } else {
        if (_test) {
          _message = 'Did not find recipient ' + recipient;

          res.status(404).send(_message);
          console.error(_message);
        }

        _message2 = 'Did not find event ' + eventId;

        res.status(404).send(_message2);
        console.error(_message2);
      }
    }).catch(function (e) {
      console.error(e);
      res.status(500).send(e);
    });
  }).then(function () {});
};
exports.sendDispatcherTestNotification = function (req, res, admin) {
  var dispatcherCode, snapshot, token, title, message, data;
  return Promise.resolve().then(function () {
    return Promise.resolve().then(function () {
      dispatcherCode = req.body.dispatcherCode;
      return admin.database().ref('/dispatchers/' + dispatcherCode).once('value');
    }).then(function (_resp) {
      snapshot = _resp;
      token = snapshot.val().token;
      title = 'בדיקה';
      message = 'בדיקה';
      data = {
        type: 'test'
      };
      return sendNotificationByUserIds({
        title: title, message: message, data: data, appType: "dispatchers", userIds: [token]
      });
    }).then(function () {
      res.status(200).send('');
    }).catch(function (e) {
      console.error(e);
      res.status(500).send(e);
    });
  }).then(function () {});
};
exports.sendVolunteerTestNotification = function (req, res, admin) {
  var phone, snapshot, token, title, message, data;
  return Promise.resolve().then(function () {
    return Promise.resolve().then(function () {
      phone = req.body.phone;

      if (phone.charAt(0) === '0') {
        phone = "+972" + phone.substr(1);
      }
      return admin.database().ref('/volunteer/' + phone).once('value');
    }).then(function (_resp) {
      snapshot = _resp;
      token = snapshot.val().NotificationToken;
      title = 'בדיקה';
      message = 'בדיקה';
      data = {
        type: 'test'
      };
      return sendNotificationByUserIds({
        title: title, message: message, data: data, appType: "volunteers", userIds: [token]
      });
    }).then(function () {
      res.status(200).send('');
    }).catch(function (e) {
      res.status(500).send(e);
    });
  }).then(function () {});
};
var sendEventNotificationToCloseByVolunteers = function sendEventNotificationToCloseByVolunteers(eventData, notificationTitle, radius) {

  var latitude = eventData.details.geo.lat;
  var longitude = eventData.details.geo.lon;
  radius = radius || Consts.NOTIFICATION_SEARCH_RADIUS_KM;
  var title = notificationTitle;

  var message = notificationHelper.formatNotification(eventData);
  var data = {
    eventId: eventData.key,
    type: 'event'
  };
  return sendNotificationByLocation({
    title: title, message: message, data: data, latitude: latitude, longitude: longitude, radius: radius, appType: "volunteers"
  });
};
var userMutedNotifications = function userMutedNotifications(user) {

  if (!user.Muted) {
    return false;
  }
  var millisSinceMuted = new Date().getTime() - user.Muted;
  return millisSinceMuted < NOTIFICATION_MUTE_EXPIRATION_MILLIS;
};

exports.sendEventNotificationToCloseByVolunteers = sendEventNotificationToCloseByVolunteers;