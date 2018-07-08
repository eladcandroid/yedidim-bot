const firebaseAdmin = require('../authenticators/firebaseAdmin');
const csv = require('csvtojson');
let DEFAULT_PASSWORD = 'Aa123456';
let isVolunteers = true;
async function importFromFile(environment, csvFile) {
  let csvUsers = await readCsv(csvFile);
  csvUsers = csvUsers.filter(u => (u.IdentityNumber && u.phoneNumber.length === 9));
  let total = csvUsers.length;
  let admin = firebaseAdmin.get(environment);
  csvUsers.forEach(async (importedUser, index) => {
      if (isVolunteers) {
        importedUser.DriveCode = importedUser.VolunteerCode;
      } else {
        importedUser.DriveCode = importedUser.DispatcherCode;
      }
      if (!importedUser.IdentityNumber || importedUser.phoneNumber.length !== 9 || !importedUser.DriveCode) {
        total--;
        return;
      }
      setTimeout(async () => {

        console.log('working on user ' + importedUser.phoneNumber);
        let firebaseUser = csvToFirebaseUser(importedUser);
        // if user exists - update
        try {
          let userRecord = await tryFetchUserByPhoneOrMail(admin, firebaseUser);
          let retrievedUser = userRecord.toJSON();
          await admin.auth().updateUser(retrievedUser.uid, firebaseUser);
          if (isVolunteers) {
            let dataBaseRecord = getVolunteerJson(importedUser);
            await admin.database().ref().child('/volunteer/' + firebaseUser.phoneNumber).update(dataBaseRecord);
          } else{
            let dataBaseRecord = getDispatcherJson(importedUser);
            await admin.database().ref().child('/dispatchers/' + importedUser.DriveCode).update(dataBaseRecord);
          }
        } catch (e) {
          if (e.message === "There is no user record corresponding to the provided identifier.") {
            try {
              firebaseUser.password = firebaseUser.password || DEFAULT_PASSWORD;
              let userRecord = await admin.auth().createUser(firebaseUser);
              let retrievedUser = userRecord.toJSON();
              console.log('Created user with uid = ' + retrievedUser.uid);
              if (isVolunteers) {
                let dataBaseRecord = getVolunteerJson(importedUser);
                await admin.database().ref().child('/volunteer/' + firebaseUser.phoneNumber).update(dataBaseRecord);
              } else{
                let dataBaseRecord = getDispatcherJson(importedUser);
                await admin.database().ref().child('/dispatchers/' + importedUser.DriveCode).update(dataBaseRecord);
              }
            } catch (e) {
              console.error(e);
            }
          } else {
            console.error(e);
          }
        }
        total--;
        console.log('finished user ' + importedUser.phoneNumber + ". " + total + " to go.");
      }, index * 500);

    }
  );
}

function tryFetchUserByPhoneOrMail(admin, firebaseUser) {
  if (firebaseUser.phoneNumber) {
    return admin.auth().getUserByPhoneNumber(firebaseUser.phoneNumber);
  }
  if (firebaseUser.email) {
    return admin.auth().getUserByEmail(firebaseUser.email);
  }
  throw "User must have user of phone";
}

function csvToFirebaseUser(csvUser) {
  if (isVolunteers) {
    let phone = '+972' + csvUser.phoneNumber;
    return {
      email: phone + "@yedidim.org",
      emailVerified: !!csvUser.emailVerified,
      phoneNumber: phone,
      password: csvUser.IdentityNumber,
      displayName: getFullName(csvUser.FirstName, csvUser.LastName),
      disabled: false
    };
  } else {
    let password = '0' + csvUser.phoneNumber;
    return {
      email: csvUser.DriveCode + "@yedidim.org",
      emailVerified: !!csvUser.emailVerified,
      password: password,
      displayName: getFullName(csvUser.FirstName, csvUser.LastName),
      disabled: false
    };
  }
}

function readCsv(csvFile) {
  let result = [];
  return new Promise((resolve, reject) => {
    csv().fromFile(csvFile)
      .on('json', (json) => {
        result.push(json);
      }).on('done', (error) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}

function getVolunteerJson(cvsUser) {
  let phone = "0" + cvsUser.phoneNumber;
  let volunteer = {
    "AnotherVehicle": "לא",
    "Area": "דן: בני ברק",
    "City": cvsUser.city || "לא ידוע",
    "DateOfBirth": cvsUser.DateOfBirth  || "לא ידוע",
    "DeviceType": "android",
    "DriveCode": cvsUser.DriveCode,
    "EmailAddress": cvsUser.EmailAddress || "לא ידוע",
    "Equipment": "",
    "FirstName": cvsUser.FirstName,
    "IdentityNumber": cvsUser.IdentityNumber,
    "LastName": cvsUser.LastName,
    "LicenseNumber": "",
    "MobilePhone": phone,
    "Occupation": "",
    "ProfessionalTrainingCourses": "",
    "StreetAddress": cvsUser.StreetAddress || "לא ידוע",
    "VehicleMake": "",
    "YourVehicle": ""
  };

  return volunteer;

}

function getDispatcherJson(importedUser) {
  let phone = "0" + importedUser.phoneNumber;
  let dispatcher = {
    "handleBot": false,
    "name": getFullName(importedUser.FirstName, importedUser.LastName),
    "notifications": true,
    "phone": phone,
    "version": "0.9.4"
  };

  return dispatcher;

}

function getFullName(firstName, lastName) {
  return (firstName || "") + " " + (lastName || "");
}

module.exports = {
  importFromFile
};