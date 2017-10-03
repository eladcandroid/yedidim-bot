let admin;
let db;

module.exports = {
  init: function(gAdmin) {
    admin = gAdmin;
    db = admin.database();
  },
  send: function(actionUrl) {
    return new Promise((resolve) => {
      db.ref('/dispatchers').orderByChild('notification').equalTo(true).once('value')
        .then(snapshot => {
          let tokens = [];
          const dispatchers = snapshot.val();
          console.info('Dispatchers were retrieved : \n', dispatchers);
          if (!dispatchers) {
            return;
          }
          for (const key in dispatchers) {
            if (dispatchers.hasOwnProperty(key)) {
              let dispatcher = dispatchers[key];
              if (dispatcher.token) {
                tokens.push(dispatcher.token);
              }
            }
            if (tokens.length > 0) {
              sendMessage(tokens, actionUrl)
                .then(() => {
                resolve()
              });
            }
            resolve();
          }
        })
        .catch(err => {
          console.error("Failed to retrieve dispatchers : \n", err);
          resolve();
        })
    });
  }
};

function sendMessage(tokens, actionUrl) {
  return new Promise((resolve) => {
    const payload = {
      "notification": {
        "title": "התראה מידידים",
        "body": "יש מקרה חדש. לטיפולך",
        "click_action": actionUrl
      }
    };

    admin.messaging().sendToDevice(tokens, payload)
      .then(response => {
        console.log("Successfully sent message : \n", response);
        resolve();
      })
      .catch(err => {
        console.error("Error sending message : \n", err);
        resolve();
      });
  });
}