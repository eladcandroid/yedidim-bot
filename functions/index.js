const functions = require('firebase-functions');

const webhook = require('./handlers/webHookHandler');
const manage = require('./handlers/manageHandler');
const setLocation = require('./handlers/setLocation');
const getVolunters = require('./handlers/getVolunters');
const takeEvent = require('./handlers/takeEvent');
const sendFollowerNotification = require('./handlers/sentFollowerNotification');
const sendExpoFollowerNotification = require('./handlers/sendExpoFollowerNotification');
const onUserCreateTrigger = require('./handlers/onUserCreateTrigger');

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

const isProduction = functions.config().instance && functions.config().instance.name === 'production';

const admin = require('./lib/admin').init(tokens.firebaseCert, tokens.firebaseConfig);
const dashbot = require('dashbot')(tokens.dashbot.apiKey).facebook;

//Main http function to handle all webhook calls
exports.webhook = functions.https.onRequest((req, res) => {
  webhook.handleHttp(req, res, admin, tokens, dashbot);
});

//function for managing the bot
exports.manage = functions.https.onRequest((req, res) => {
  manage.handleHttp(req, res, tokens);
});

exports.onUserCreateTrigger = functions.database.ref('/volunteer/{id}').onWrite(event => {
  if (!isProduction) {
    onUserCreateTrigger.handleTrigger(event, admin);
  }
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

exports.sendFollowerNotification = functions.database.ref('/events/{eventId}').onUpdate(event => {
  if (!isProduction) {
    sendFollowerNotification.handleUpdateEvent(event, admin);
  }
});

exports.sendExpoFollowerNotification = functions.database.ref('/events/{eventId}').onUpdate(event => {
  if (!isProduction) {
    sendExpoFollowerNotification.handleUpdateEvent(event, admin);
  }
});