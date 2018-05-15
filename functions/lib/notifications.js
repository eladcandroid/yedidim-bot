const Expo = require('expo-server-sdk')
const bunyan = require('bunyan')
const Bunyan2Loggly = require('bunyan-loggly')
const functions = require('firebase-functions')

const expo = new Expo()
let db

const logglyStream = new Bunyan2Loggly(
  {
    token: '622dc788-f45c-429d-af18-e1a89286b883',
    subdomain: 'arubin'
  },
  5,
  1000
)

const stream = {
  level: 'warn',
  type: 'raw',
  stream: {
    write: obj => {
      console.log(
        [
          bunyan.nameFromLevel[obj.level],
          obj.msg,
          obj.err ? bunyan.stdSerializers.err(obj.err).stack : false
        ]
          .filter(item => !!item)
          .join(': ')
      )
    }
  }
}

// create the logger
const logger = bunyan.createLogger({
  name: 'yedidim-log',
  streams: [
    stream,
    {
      type: 'raw',
      stream: logglyStream
    }
  ]
})

const instance =
  (functions.config().instance && functions.config().instance.name) ||
  'sandbox2'

module.exports = {
  init: function(admin) {
    db = admin.database()
  },
  send: function(context) {
    return new Promise(resolve => {
      db
        .ref('/dispatchers')
        .orderByChild('notifications')
        .equalTo(true)
        .once('value')
        .then(snapshot => {
          let tokens = []
          const dispatchers = snapshot.val()
          console.info(
            'Dispatchers were retrieved : \n',
            Object.keys(dispatchers)
          )
          if (!dispatchers) {
            return
          }
          for (const key in dispatchers) {
            if (dispatchers.hasOwnProperty(key)) {
              let dispatcher = dispatchers[key]
              if (dispatcher.token && dispatcher.handleBot) {
                tokens.push({ token: dispatcher.token, dispatcher: key })
              }
            }
          }
          if (tokens.length > 0) {
            sendPushNotification(tokens, context).then(() => {
              resolve()
            })
          }
          resolve()
        })
        .catch(err => {
          console.error('Failed to retrieve dispatchers : \n', err)
          resolve()
        })
    })
  }
}

function sendPushNotification(tokens, { details, key }) {
  return new Promise(resolve => {
    let messages = []
    for (let pushToken of tokens) {
      const { token, dispatcher } = pushToken
      if (!Expo.isExpoPushToken(token)) {
        logger.info(
          {
            area: 'notifications',
            origin: 'bot',
            token,
            dispatcher,
            status: 'invalid-token',
            eventId: key,
            instance
          },
          `Push token ${token} is not a valid Expo push token`
        )
        console.error(`Push token ${token} is not a valid Expo push token`)
        continue
      }

      messages.push({
        to: token,
        sound: 'default',
        title: 'נפתח ארוע חדש',
        body: 'ארוע ב ' + details.address,
        data: {
          type: 'event',
          eventId: key,
          userId: dispatcher
        }
      })
    }

    if (messages.length === 0) {
      resolve()
    }

    const chunks = expo.chunkPushNotifications(messages)
    let promises = []

    for (let chunk of chunks) {
      promises.push(
        new Promise(resolve => {
          console.log('Sending notification to ', chunk)
          expo
            .sendPushNotificationsAsync(chunk)
            .then(receipts => {
              const results = (receipts || []).map((receipt, idx) =>
                Object.assign({}, receipt, tokens[idx])
              )

              results.forEach(result => {
                logger.info(
                  Object.assign(
                    {
                      area: 'notifications',
                      origin: 'bot',
                      eventId: key,
                      instance
                    },
                    result
                  ),
                  `Sent notifications`
                )
              })

              console.log('Successfully sent notifications', results)
              resolve()
            })
            .catch(err => {
              console.error('Failed to send notifications', err)
              resolve()
            })
        })
      )
    }
    Promise.all(promises).then(() => resolve())
  })
}
