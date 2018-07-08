// let GeoFire = require('geofire');
// let firebase = require('./authenticators/firebaseAdmin').get('sandbox2');
// const Expo = require('expo-server-sdk');
// let expo = new Expo();
//
// updateUserPassword('+972547344452', '200063014').then(result => {
//   console.log('Done');
// });

async function testDispatchers() {
  let usersExporter = require('./users/usersExporter');
  let dispatchers = await usersExporter.getDispatchersWithToken('production');
  let notifications = dispatchers.map(dispatcher => {
    return {
      to: dispatcher.token,
      title: 'בדיקה',
      body: 'בדיקה',
      data: {
        type: 'test'
      },
      sound: 'default'
    }
  });

  let chunks = expo.chunkPushNotifications(notifications);
  let promises = [];
  for (let chunk of chunks) {
    ((chunk) => {
      let promise = expo.sendPushNotificationsAsync(chunk)
        .then(receipts => {
          for (let i = 0; i < receipts.length; i++) {
            let status = receipts[i];
            let notification = chunk[i];
            notification.success = status.status === 'ok';
          }
        })
        .catch(err => {
          console.error("Failed to send notifications : \n", err);
        });
      promises.push(promise);
    })(chunk);
  }
  return Promise.all(promises).then(() => {
    notifications.forEach(notification => {
      dispatchers.forEach(dispatcher => {
        if (notification.to === dispatcher.token) {
          dispatcher.success = notification.success;
        }
      });
    });
    console.log(`token,name,phone,success`);
    dispatchers.forEach(dispatcher => {
      console.log(`${dispatcher.token},${dispatcher.name},${dispatcher.phone},${dispatcher.success}`);
    });
  });
}

async function testVolunteers() {
  let usersExporter = require('./users/usersExporter');
  let volunteers = await usersExporter.getVolunteersWithToken('production');
  let notifications = volunteers.map(volunteer => {
    return {
      to: volunteer.NotificationToken,
      title: 'בדיקה',
      body: 'בדיקה',
      sound: 'default'
    }
  });

  let chunks = expo.chunkPushNotifications(notifications);
  let promises = [];
  for (let chunk of chunks) {
    ((chunk) => {
      let promise = expo.sendPushNotificationsAsync(chunk)
        .then(receipts => {
          for (let i = 0; i < receipts.length; i++) {
            let status = receipts[i];
            let notification = chunk[i];
            notification.success = status.status === 'ok';
          }
        })
        .catch(err => {
          console.error("Failed to send notifications : \n", err);
        });
      promises.push(promise);
    })(chunk);
  }
  return Promise.all(promises).then(() => {
    notifications.forEach(notification => {
      volunteers.forEach(volunteer => {
        if (notification.to === volunteer.NotificationToken) {
          volunteer.success = notification.success;
        }
      });
    });
    console.log(`NotificationToken,FirstName,LastName,MobilePhone,IdentityNumber,DriveCode,success`);
    volunteers.forEach(volunteer => {
      console.log(`${volunteer.NotificationToken},${volunteer.FirstName},${volunteer.LastName},${volunteer.MobilePhone},${volunteer.IdentityNumber},${volunteer.DriveCode},${volunteer.success}`);
    });
  });
}

async function resetDispatchersToken() {
  let dispatchersById = (await firebase.database().ref().child('/dispatchers').once('value')).val();
  let dispatchers = Object.keys(dispatchersById).map(id => {
    dispatchersById[id].code = id;
    return dispatchersById[id];
  });

  dispatchers.forEach(d => {
    if (d.token) {
      console.log(d.name);
    }
    firebase.database().ref().child('/dispatchers/' + d.code).update({
      token: null
    });
  });
}

async function resetVolunteersToken() {
  let dispatchersById = (await firebase.database().ref().child('/volunteer').once('value')).val();
  let dispatchers = Object.keys(dispatchersById).map(id => {
    dispatchersById[id].code = id;
    return dispatchersById[id];
  });

  dispatchers.forEach(d => {
    firebase.database().ref().child('/volunteer/' + d.code).update({
      NotificationToken: null
    });
  });
}
async function updateHandleBot() {

  let shouldHandleBots = [
    "540",
    "600",
    "607",
    "625",
    "704",
    "720",
    "781",
    "847",
    "907",
    "912",
    "917",
    "922",
    "934",
    "936",
    "937",
    "989",
    "001",
    "002",
    "017",
    "030"
  ];
  let dispatchersById = (await firebase.database().ref().child('/dispatchers').once('value')).val();
  let dispatchers = Object.keys(dispatchersById).map(id => {
    dispatchersById[id].code = id;
    return dispatchersById[id];
  });
  let botHandlers = dispatchers.filter(d => d.handleBot);

  botHandlers.forEach(d => {
    if (shouldHandleBots.indexOf(d.code) === -1) {
      console.log('will remove ' + d.name);

      firebase.database().ref().child('/dispatchers/' + d.code).update({
        handleBot: false
      });
    }
  });
};

/*let usersImporter = require('./users/userImporter');
usersImporter.importFromFile('production', "C:\\Users\\dor\\Desktop\\users 2018_09_06\\" +
  "" +
  "users template - Sheet1.csv")
    .then(() => {
        console.log('Done');
    });*/


// updateUserLocation('+972526825255', 32.0778397, 34.7681266);
//  createEventAtLocation(32.076142, 34.771710).then(() => console.log('Done.'));

async function sendNotification(code) {
  // let snapshot = await firebase.database().ref().child('/dispatchers/' + code).once('value');
  // let token = snapshot.val().token;
  let snapshot = await firebase.database().ref().child('/volunteer/' + code).once('value');
  let token = snapshot.val().NotificationToken;
  let notification = {
    to: token,
    title: 'בדיקה',
    data: {
      type: 'test'
    },
    body: 'בדיקה',
    sound: 'default'
  };

  let notifications = [notification];
  let chunks = expo.chunkPushNotifications(notifications);
  let promises = [];
  for (let chunk of chunks) {
    ((chunk) => {
      let promise = expo.sendPushNotificationsAsync(chunk)
        .then(receipts => {
          for (let i = 0; i < receipts.length; i++) {
            let status = receipts[i];
            let notification = chunk[i];
            notification.success = status.status === 'ok';
          }
          console.log("Successfully sent notifications : \n", receipts);
        })
        .catch(err => {
          console.error("Failed to send notifications : \n", err);
        });
      promises.push(promise);
    })(chunk);
  }
  return Promise.all(promises).then(() => notifications);
}

async function updateUserLocation(phoneNumber, latitude, longitude) {
  try {
    let geoFire = new GeoFire(firebase.database().ref('user_location'));
    await geoFire.set(phoneNumber, [latitude, longitude]);
  } catch (e) {
    console.error(e);
  }
};

async function updateUserPassword(phoneNumber, id) {

  try {
    firebase.database().ref().child('volunteer/' + phoneNumber)
      .update({IdentityNumber: id});

    let userRecord = await firebase.auth().getUserByEmail(phoneNumber + '@yedidim.org');

    let uid = userRecord.uid || userRecord.toJSON().uid;
    await firebase.auth().updateUser(uid, {
      phoneNumber: phoneNumber,
      password: id,
      email: phoneNumber + '@yedidim.org'
    });
  } catch (e) {
    console.error(e);
  }
};

function fetchEvents() {
  const events = [];
  const nearEventIds = [];
  let geoFire = new GeoFire(firebase.database().ref().child('events-locations'));
  let geoQuery = geoFire.query({
    center: [34, 34],
    radius: 200000
  });

  var onKeyEnteredRegistration = geoQuery.on("key_entered", function (key, location) {
    console.log(key + " entered the query. Hi " + key + "!");
    nearEventIds.push(key);
  });

  var onReadyRegistration = geoQuery.on("ready", function () {
    console.log("*** 'ready' event fired - cancelling query ***");
    geoQuery.cancel();
    console.log(`Got total of ${nearEventIds.length} events`);
    firebase.database()
      .ref('events')
      .orderByChild('status')
      .equalTo('sent')
      .once('value', snapshot => {
        let eventsById = snapshot.val() || {};
        let nearSentEvents = Object.keys(eventsById).filter(eventId => nearEventIds.indexOf(eventId) !== -1)
          .map(eventId => eventsById[eventId]);
        nearSentEvents
          .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1))
          .slice(0, 25)
          .forEach(childSnapshot => {
            events.push(childSnapshot)
          });
        console.log(events);
      });
  });
}

async function createEventAtLocation(x, y) {
  try {
    let eventKey = firebase.database().ref().child('events').push().key;
    await firebase.database().ref('events/' + eventKey).set({
        "details": {
          "address": "מבצע קדש 34, תל אביב יפו, ישראל",
          "caller name": "Daniel Halevi",
          "car type": "מזדה 3",
          "case": 1,
          "city": "תל אביב יפו",
          "geo": {
            "lat": x,
            "lon": y
          },
          "more": "כן",
          "phone number": "0542436119",
          "street_name": "מבצע קדש",
          "street_number": "34"
        },
        "key": eventKey,
        "lastMessage": "confirm_request",
        "psid": "1757243114317389",
        "source": "fb-bot",
        "status": "sent",
        "timestamp": new Date().getTime()
      }
    );
    let geoFire = new GeoFire(firebase.database().ref('event-location'));
    await geoFire.set(eventKey, [x, y]);
  } catch (e) {
    console.error(e);
  }
}

function fishLocations() {

  // Generate a random Firebase location
  var firebaseRef = firebase.database().ref('event-locations').push();

  // Create a new GeoFire instance at the random Firebase location
  var geoFire = new GeoFire(firebaseRef);

  // Create the locations for each fish
  var fishLocations = [
    [-40, 159],
    [90, 70],
    [-46, 160],
    [0, 0]
  ];

  // Set the initial locations of the fish in GeoFire
  log("*** Setting initial locations ***");
  var promises = fishLocations.map(function (location, index) {
    return geoFire.set("fish" + index, location).then(function () {
      log("fish" + index + " initially set to [" + location + "]");
    });
  });

  // Once all the fish are in GeoFire, log a message that the user can now move fish around
  Promise.all(promises).then(function () {
    log("*** Creating GeoQuery ***");
    // Create a GeoQuery centered at fish2
    var geoQuery = geoFire.query({
      center: fishLocations[2],
      radius: 3000
    });

    var onKeyEnteredRegistration = geoQuery.on("key_entered", function (key, location) {
      log(key + " entered the query. Hi " + key + "!");
    });

    var onReadyRegistration = geoQuery.on("ready", function () {
      log("*** 'ready' event fired - cancelling query ***");
      geoQuery.cancel();
    })
  });


  /*************/
  /*  HELPERS  */
  /*************/

  /* Logs to the page instead of the console */
  function log(message) {
    console.log(message);
  }

}

function queryEvents() {
  let eventsRef = firebase.database().ref('/events-locations').push();
  let geofire = new GeoFire(eventsRef);

  // Create a GeoQuery centered at fish2
  let geoQuery = geofire.query({
    center: [30.1, 30.1],
    radius: 2000
  });

  let onKeyEnteredRegistration = geoQuery.on("key_entered", function (key, location) {
    console.log(key + " entered the query. Hi " + key + "!");
  });

  let onReadyRegistration = geoQuery.on("ready", function () {
    console.log("*** 'ready' event fired - cancelling query ***");
    // geoQuery.cancel();
  })
}

function setLocations() {
  let eventsRef = firebase.database().ref('/events-locations').push();
  let geofire = new GeoFire(eventsRef);
  geofire.set('event_1', [30, 30])
    .then(() => {
      geofire.set('event_2', [60, 60])
        .then(() => {
          console.log('Done.')
        });
    });
}

/*
var usersExporter = require('./users/usersExporter');

usersExporter.exportToFileWithExtendedData('production')
    .then(() => {
        console.log('Done');
    });
    */

async function createNewUser(phoneNumber, id, firstName, lastName,) {

  try {
    let userRecord = await
      firebase.auth().createUser({
        email: phoneNumber + "@yedidim.org",
        emailVerified: false,
        phoneNumber: phoneNumber,
        password: id,
        displayName: `${firstName} ${lastName}`,
        disabled: false
      });

    let retrievedUser = userRecord.toJSON();
    console.log('Created user with uid = ' + retrievedUser.uid);

    await
      firebase.database().ref('volunteer/' + phoneNumber).set({
        "AnotherVehicle": "לא",
        "Area": "ארצי, מרכז: דן (תל אביב, רמת גן, גבעתיים ובני ברק)",
        "City": "תל אביב",
        "DateOfBirth": "2/4/1986",
        "DeviceType": "android",
        "DriveCode": "1003",
        "EmailAddress": "+972546797228@yedidim.org",
        "Equipment": "כבלים להתנעה, בוסטר להתנעה - (מצבר נייד), קומפרסור - (ניפוח אוויר), מגבה (ג'ק) להרמת הרכב, מפתח גלגלים, ספריי פנצ'ר, ערכת פתיחת רכב נעול, רצועות למשיכת רכבים תקועים, משאבת דלק, וו גרירה/נגרר",
        "FirstName": "שגיא",
        "IdentityNumber": "123456",
        "LastName": "רבינוביץ",
        "LicenseNumber": "1234567",
        "MobilePhone": "+972546797228",
        "StreetAddress": "בוגרשוב 5",
        "VehicleMake": "פורמולה 1",
        "YourVehicle": "פרטי"
      });
  } catch (e) {
    console.error(e);
  }
}

async function updateEvents() {

  let typeMap = {
    0: {
      "category": "Starting",
      "subCategory": "Cables"
    },
    1: {
      "category": "FlatTire",
      "subCategory": "WheelChange"
    },
    2: {
      "category": "FlatTire",
      "subCategory": "Compressor"
    },
    3: {
      "category": "SlammedDoor"
    },
    4: {"category": "OilWaterFuel"},
    5: {"category": "Extraction"},
    6: {
      "category": "Starting",
      "subCategory": "ResetCoder"
    },
    7: {
      "category": "FlatTire",
      "subCategory": "NoSpare"
    },
    8: {"category": "Other"},
    9: {"category": "LockedCar"}
  };
  let cases = Object.keys(typeMap);
  let eventsById = (await firebase.database().ref().child('/events').once('value')).val();
  let strings = Object.keys(eventsById);
  console.log(`total of ${strings.length}`);
  strings.forEach(async eventId => {
    let event = eventsById[eventId];
    if (!event.details || event.details.category) {
      return;
    }
    let eventCase = event.details.case;
    if (eventCase === undefined || cases.indexOf(eventCase.toString()) === -1) {
      eventCase = 8;
    }
    let category = typeMap[eventCase.toString()];
    Object.assign(event.details, category);
    try {
      await firebase.database().ref().child('/events/' + event.key).update(event);
    } catch (e) {
      console.log('Error');
    }
  });
}