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
            return resolve (undefined);
          }
          for (const key in events){
            if (events.hasOwnProperty(key)) {
              let event = events[key];
              const isLatelyUpdated = event.timestamp > (Date.now() - 120 * 60 * 1000);
              if (isLatelyUpdated) {
                // Take the event that was updated lately
                console.info('Found an up to date event ', event);
                resolve(event)
              } else if (event.status === EventStatus.Draft) {
                // delete draft event that is old
                console.info('Deleting an old event ', event);
                this.delete(event);
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
    return new Promise((resolve) => {
      if (!context.key) {
        context.key = db.ref().child('events').push().key;
      }
      context['timestamp'] = Date.now();
      db.ref('/events/' + context.key).set(context)
        .then (() => {
          console.info('Context (' + context.psid + ') was set : \n', context);
          resolve();
        })
        .catch(err => {
          console.error('Failed to set context (' + context.psid + ') : \n', + err);
          resolve();
        })
    });
  },
  delete: function(context) {
    return new Promise((resolve) => {
      if (!context.key) {
        resolve();
      }
      return db.ref('/events/' + context.key).remove();
    });
  }
};