const CallStatus = require('./consts').CallStatus;

let db;

module.exports = {
  init: function(admin) {
    db = admin.database();
  },
  get: function(psid) {
    return new Promise((resolve) => {
      db.ref('/calls').orderByChild('psid').equalTo(psid).once('value')
        .then(snapshot => {
          const calls = snapshot.val();
          console.info('Context (' + psid + ') was retrieved : \n', calls);
          if (!calls){
            resolve (undefined);
          }
          for (const key in calls){
            if (calls.hasOwnProperty(key)) {
              let call = calls[key];
              if (call.status === CallStatus.Draft || call.status === CallStatus.Submitted) {
                if (call.timestamp < (Date.now() - 60 * 60 * 1000)) {
                  //if call was made more than 1 hour ago then start again
                  call.status = CallStatus.Archived;
                  this.set(call);
                  resolve(undefined);
                }
                call.key = key;
                resolve(call);
              }
            }
          }
          resolve(undefined);
        })
        .catch(err => {
          console.error('Failed to retrieve context (' + psid + ') : \n', err);
          //Fallback is to return undefined
          resolve(undefined);
        })
    });
  },
  set: function(context) {
    return new Promise((resolve, reject) => {
      if (!context.key) {
        context.key = db.ref().child('calls').push().key;
      }
      context['timestamp'] = Date.now();
      db.ref('/calls/' + context.key).set(context, err => {
        if (err) {
          console.error('Failed to set context (' + context.psid + ') : \n', + err);
          reject(err);
        }
        else {
          console.info('Context (' + context.psid + ') was set : \n', context);
          resolve();
        }
      })
    });
  }
};