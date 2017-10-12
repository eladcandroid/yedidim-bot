const EventStatus = require('./consts').EventStatus;

let db;

module.exports = {
  init: function(admin) {
    db = admin.database();
  },
  get: function(psid) {
    return new Promise((resolve) => {
      db.ref('/events').orderByChild('psid').equalTo(psid).once('value')
        .then(snapshot => {
          const events = snapshot.val();
          console.info('Context (' + psid + ') was retrieved : \n', events);
          if (!events){
            resolve (undefined);
          }
          for (const key in events){
            if (events.hasOwnProperty(key)) {
              let event = events[key];
              if (event.status === EventStatus.Draft || event.status === EventStatus.Submitted) {
                if (event.timestamp < (Date.now() - 60 * 60 * 1000)) {
                  //if event was made more than 1 hour ago then start again
                  event.status = EventStatus.Archived;
                  this.set(event);
                  resolve(undefined);
                }
                event.key = key;
                resolve(event);
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
        context.key = db.ref().child('events').push().key;
      }
      context['timestamp'] = Date.now();
      db.ref('/events/' + context.key).set(context, err => {
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