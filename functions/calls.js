const admin = require("firebase-admin");
const serviceAccount = require("./_firebaseKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://yedidim-sandbox.firebaseio.com"
});

const db = admin.database();

module.exports = {
  get: function(psid) {
    return new Promise((resolve) => {
      db.ref('/calls/' + psid).once('value')
        .then(snapshot => {
          const context = snapshot.val();
          console.info('Context (' + psid + ') was retrieved : \n', context);
          if (context && context.timestamp < (Date.now() - 60 * 60 * 1000)){
            //if call was made more than 1 hour ago then start again
            resolve (undefined);
          }
          resolve(context);
        })
        .catch(err => {
          console.error('Failed to retrieve context (' + psid + ') : \n', err);
          //Fallback is to return undefined
          resolve(undefined);
        })
    });
  },
  set: function(psid, context) {
    return new Promise((resolve, reject) => {
      context['timestamp'] = Date.now();
      db.ref('/calls/' + psid).set(context, err => {
        if (err) {
          console.error('Failed to set context (' + psid + ') : \n', + err);
          reject(err);
        }
        else {
          console.info('Context (' + psid + ') was set : \n', context);
          resolve();
        }
      })
    });
  }
};