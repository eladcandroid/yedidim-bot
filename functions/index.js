const functions = require('firebase-functions')
const admin = require('firebase-admin')
admin.initializeApp(functions.config().firebase)

const webhook = require('./handlers/webHookHandler')
const manage = require('./handlers/manageHandler')
const onUpdateEvent = require('./handlers/onUpdateEventHandler')
const sendExpoFollowerNotification = require('./handlers/sendExpoFollowerNotification')
const onEventCreateAddGeo = require('./handlers/onEventCreatedAddGeo')

const tokens = getTokens(require('./_tokens.json'))

//Get the tokens according to the instance the functions run on
function getTokens(json) {
  if (!functions.config().instance) {
    return json.sandbox2
  }
  if (functions.config().instance.name === 'sandbox') {
    return json.sandbox
  }
  if (functions.config().instance.name === 'production') {
    return json.production
  }
  return json.sandbox2
}

//Main http function to handle all webhook calls
exports.webhook = functions.https.onRequest((req, res) => {
  return webhook.handleHttp(req, res, admin, tokens)
})

//function for managing the bot
exports.manage = functions.https.onRequest((req, res) => {
  return manage.handleHttp(req, res, tokens)
})

exports.sendExpoFollowerNotification = functions.database
  .ref('/events/{eventId}')
  .onWrite(event => {
    return sendExpoFollowerNotification.handleUpdateEvent(event, admin)
  })

exports.onUpdateEvent = functions.database
  .ref('/events/{eventId}')
  .onWrite(event => {
    return onUpdateEvent.updateIsOpenProperty(event)
  })

exports.onEventCreateAddGeo = functions.database
  .ref('/events/{eventId}')
  .onWrite(event => {
    return onEventCreateAddGeo.indexEventGeoLocation(event, admin)
  })

exports.sendNotificationBySearchRadius = functions.https.onRequest(
  (req, res) => {
    return sendExpoFollowerNotification.sendNotificationBySearchRadius(
      req,
      res,
      admin
    )
  }
)

exports.sendNotificationToRecipient = functions.https.onRequest((req, res) => {
  return sendExpoFollowerNotification.sendNotificationToRecipient(
    req,
    res,
    admin
  )
})

exports.sendTestNotification = functions.https.onRequest((req, res) => {
  return sendExpoFollowerNotification.sendTestNotification(req, res, admin)
})
