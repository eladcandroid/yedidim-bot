const Expo = require('expo-server-sdk');

const expo = new Expo();
let db;

module.exports = {
  init: function(admin) {
    db = admin.database();
  },
  send: function(details) {
    return new Promise((resolve) => {
      db.ref('/dispatchers').orderByChild('notifications').equalTo(true).once('value')
        .then(snapshot => {
          let tokens = [];
          const dispatchers = snapshot.val();
          console.info('Dispatchers were retrieved : \n', Object.keys(dispatchers));
          if (!dispatchers) {
            return;
          }
          for (const key in dispatchers) {
            if (dispatchers.hasOwnProperty(key)) {
              let dispatcher = dispatchers[key];
              if (dispatcher.token && dispatcher.handleBot) {
                tokens.push({ token: dispatcher.token, dispatcher: key });
              }
            }
          }
          if (tokens.length > 0) {
            sendPushNotification(tokens, details)
              .then(() => {
                resolve()
              });
          }
          resolve();
        })
        .catch(err => {
          console.error("Failed to retrieve dispatchers : \n", err);
          resolve();
        })
    });
  }
};

function sendPushNotification(tokens, details) {
  return new Promise((resolve) => {
    let messages = [];
    for (let pushToken of tokens) {
      const { token } = pushToken
      if (!Expo.isExpoPushToken(token)) {
        console.error(`Push token ${token} is not a valid Expo push token`);
        continue;
      }

      messages.push({
        to: pushToken,
        sound: 'default',
        title: 'נפתח ארוע חדש',
        body: 'ארוע ב ' + details.address,
        data: {
          type: 'bot'
        }
      })
    }

    if (messages.length === 0) {
      resolve();
    }

    const chunks = expo.chunkPushNotifications(messages);
    let promises = [];

    for (let chunk of chunks) {
      promises.push(new Promise(resolve => {
        console.log("Sending notification to ", chunk);
        expo.sendPushNotificationsAsync(chunk)
          .then(receipts => {
            console.log("Successfully sent notifications : \n", (receipts || []).map((receipt, idx) => Object.assign({}, receipt, tokens[idx])));
            resolve();
          })
          .catch(err => {
            console.error("Failed to send notifications : \n", err);
            resolve();
          });
      }));
    }
    Promise.all(promises).then(() => resolve());
  });
}