const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

const webhook = require('./handlers/webHookHandler');
const manage = require('./handlers/manageHandler');
const onUpdateEvent = require('./handlers/onUpdateEventHandler');
const setLocation = require('./handlers/setLocation');
const getVolunters = require('./handlers/getVolunters');
const takeEvent = require('./handlers/takeEvent');
const sendFollowerNotification = require('./handlers/sentFollowerNotification');
const sendExpoFollowerNotification = require('./handlers/sendExpoFollowerNotification');
const onUserCreateTrigger = require('./handlers/onUserCreateTrigger');
const openedEvents = require('./handlers/openedEvents');
const onEventCreateAddGeo = require('./handlers/onEventCreatedAddGeo');

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

const dashbot = require('dashbot')(tokens.dashbot.apiKey).facebook;

//Main http function to handle all webhook calls
exports.webhook = functions.https.onRequest((req, res) => {
  return webhook.handleHttp(req, res, admin, tokens, dashbot);
});

//function for managing the bot
exports.manage = functions.https.onRequest((req, res) => {
  return manage.handleHttp(req, res, tokens);
});

exports.onUserCreateTrigger = functions.database.ref('/volunteer/{id}').onWrite(event => {
  return onUserCreateTrigger.handleTrigger(event, admin);
});

exports.setLocation = functions.https.onRequest((req, res) => {
  return setLocation.handleHttp(req, res, admin);
});

exports.getVolunters = functions.https.onRequest((req, res) => {
  return getVolunters.handleHttp(req, res, admin);
});

exports.takeEvent = functions.https.onRequest((req, res) => {
  return takeEvent.handleHttp(req, res, admin);
});

exports.sendFollowerNotification = functions.database.ref('/events/{eventId}').onWrite(event => {
  return sendFollowerNotification.handleUpdateEvent(event, admin);
});

exports.sendExpoFollowerNotification = functions.database.ref('/events/{eventId}').onWrite(event => {
  return sendExpoFollowerNotification.handleUpdateEvent(event, admin);
});

exports.onUpdateEvent = functions.database.ref('/events/{eventId}').onWrite(event => {
  return onUpdateEvent.onWrite(event)
});

exports.onEventCreateAddGeo = functions.database.ref('/events/{eventId}').onWrite(event => {
  return onEventCreateAddGeo.onWrite(event, admin);
});

exports.getOpenedEvents = functions.https.onRequest((req, res) => {
  return openedEvents.handleHttp(req, res, admin);
});

exports.sendNotificationBySearchRadius = functions.https.onRequest((req, res) => {
    return sendExpoFollowerNotification.sendNotificationBySearchRadius(req, res, admin);
});

exports.sendNotificationToRecipient = functions.https.onRequest((req, res) => {
    return sendExpoFollowerNotification.sendNotificationToRecipient(req, res, admin);
});
