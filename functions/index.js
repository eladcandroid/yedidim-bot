const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const webhook = require('./handlers/webHookHandler');
const manage = require('./handlers/manageHandler');
const sendExpoFollowerNotification = require('./handlers/notificationsHandler');
const eventUpdatesHandlers = require("./handlers/eventUpdatesHandlers");

const tokens = getTokens(require('./_tokens.json'));

//Get the tokens according to the instance the functions run on
function getTokens(json) {
  if (!functions.config().instance) {
    return json.sandbox2;
  }
  if (functions.config().instance.name === 'sandbox') {
    return json.sandbox;
  }
  if (functions.config().instance.name === 'production') {
    return json.production;
  }
  return json.sandbox2;
}

//Main http function to handle all webhook calls
exports.webhook = functions.https.onRequest((req, res) => {
  return webhook.handleHttp(req, res, admin, tokens);
});

//function for managing the bot
exports.manage = functions.https.onRequest((req, res) => {
  return manage.handleHttp(req, res, tokens);
});

exports.onEventCreated = functions.database.ref('/events/{eventId}').onCreate((snapshot, context) => {
  return eventUpdatesHandlers.onEventCreated(snapshot, context);
});

exports.onStatusUpdated = functions.database.ref('/events/{eventId}/status').onUpdate((event, context) => {
  return eventUpdatesHandlers.onEventStatusUpdate(event, context);
});

exports.onIsOpenUpdated = functions.database.ref('/events/{eventId}/isOpen').onWrite((event, context) => {
  return eventUpdatesHandlers.onEventIsOpenUpdate(event, context, admin);
});

exports.onEventDeleted = functions.database.ref('/events/{eventId}').onDelete((snapshot, context) => {
  return eventUpdatesHandlers.onEventDeleted(snapshot, context, admin);
});

exports.sendNotificationBySearchRadius = functions.https.onRequest((req, res) => {
    return sendExpoFollowerNotification.sendNotificationBySearchRadius(req, res, admin);
});

exports.sendNotificationToRecipient = functions.https.onRequest((req, res) => {
    return sendExpoFollowerNotification.sendNotificationToRecipient(req, res, admin);
});

exports.sendDispatcherTestNotification = functions.https.onRequest((req, res) => {
    return sendExpoFollowerNotification.sendDispatcherTestNotification(req, res, admin);
});

exports.sendVolunteerTestNotification = functions.https.onRequest((req, res) => {
    return sendExpoFollowerNotification.sendVolunteerTestNotification(req, res, admin);
});
