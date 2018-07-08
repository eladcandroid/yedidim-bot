const firebaseAdminAuthenticator = require('../authenticators/firebaseAdmin');
const fs = require('fs');
const dateFormat = require('dateformat');
const csvWriter = require('csv-write-stream');
const writer = csvWriter();

function exportToFileFromAuth(environment, csvFilePath) {
  let writer = getCsvWriter(csvFilePath, environment);
  scrollUsers(firebaseAdminAuthenticator.get(environment), (user) => {
    let exportedUser = (({uid, email, emailVerified, displayName, photoURL, phoneNumber, disabled}) =>
      ({uid, email, emailVerified, displayName, photoURL, phoneNumber, disabled}))(user);
    writer.write(exportedUser);
  }, () => {
    writer.end();
  });
}

function scrollUsers(firebaseAdmin, onUser, onEnd, nextPageToken) {
  firebaseAdmin.auth().listUsers(1000, nextPageToken)
    .then(function (listUsersResult) {
      listUsersResult.users.forEach(function (userRecord) {
        onUser(userRecord.toJSON());
      });
      if (listUsersResult.pageToken) {
        scrollUsers(firebaseAdmin, onUser, onEnd, listUsersResult.pageToken)
      } else {
        onEnd();
      }
    })
    .catch(function (error) {
      console.log("Error listing users:", error);
    });
}

function getCsvWriter(csvFilePath, environment) {
  csvFilePath = (csvFilePath || ('users_' + environment + "_")) + dateFormat(new Date(), 'yyyymmdd_HHMMss') + ".csv";
  let writer = csvWriter();
  writer.pipe(fs.createWriteStream(csvFilePath));
  return writer;
}

async function exportToFileFromDatabase(environment, csvFilePath) {
  getCsvWriter(csvFilePath, environment);
  let admin = firebaseAdminAuthenticator.get(environment);
  let snapshot = await admin.database().ref('volunteer/').once('value');
  Object.entries(snapshot.toJSON()).forEach(([key, doc]) => {
    if (key === null || key === "null") {
      debugger;
    }
  });

  debugger;
}

async function exportToFileWithExtendedData(environment, csvFilePath) {
  let writer = getCsvWriter(csvFilePath, environment);
  let admin = firebaseAdminAuthenticator.get(environment);
  scrollUsers(admin, async (user) => {
    let exportedUser = (({uid, email, emailVerified, displayName, photoURL, phoneNumber, disabled}) =>
      ({uid, email, emailVerified, displayName, photoURL, phoneNumber, disabled}))(user);
    let snapshot = await admin.database().ref('volunteer/' + exportedUser.phoneNumber).once('value');
    let userMetadata = snapshot && snapshot.val();
    exportedUser.IdentityNumber = (userMetadata && userMetadata.IdentityNumber) || '';
    exportedUser.FirstName = (userMetadata && userMetadata.FirstName) || '';
    exportedUser.LastName = (userMetadata && userMetadata.LastName) || '';
    writer.write(exportedUser);
  }, () => {
    // writer.end();
  });
}

async function getFiltered(environment, collection, filter) {
  filter = filter || (() => true);
  let firebase = firebaseAdminAuthenticator.get(environment);
  let snapshot = await firebase.database().ref(collection).once('value');
  let docsById = snapshot.val();
  let docs = [];
  for (let id in docsById) {
    if (docsById.hasOwnProperty(id)) {
      let doc = docsById[id];
      if (filter(doc)) {
        docs.push(doc);
      }
    }
  }
  return docs;
}

async function getVolunteersWithToken(environment) {
  return getFiltered(environment, 'volunteer', volunteer => {
    return !!volunteer["NotificationToken"];
  });
}

async function getDispatchersWithToken(environment) {
  return getFiltered(environment, 'dispatchers', dispatcher => {
    return !!dispatcher["token"] && !!dispatcher["notifications"];
  });
}

function writeDataToCsv(dataArray, csvPath) {
  let writer = getCsvWriter(csvPath);
  dataArray.forEach(entry => {
    writer.write(entry);
  });
  writer.end();
}

async function exportDispatchersWithToken(environment) {
  let dispatchers = await getDispatchersWithToken(environment);
  writeDataToCsv(dispatchers, "dispatchers");
}

async function exportVolunteersWithToken(environment) {
  let volunteers = await getVolunteersWithToken(environment);
  writeDataToCsv(volunteers, "volunteers");
}

module.exports = {
  exportToFileFromAuth,
  exportToFileFromDatabase,
  exportToFileWithExtendedData,
  exportDispatchersWithToken,
  exportVolunteersWithToken,
  getVolunteersWithToken,
  getDispatchersWithToken,
  writeDataToCsv
};