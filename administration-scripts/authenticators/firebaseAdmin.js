const admin = require('firebase-admin');
const credentialsRep = require('./credentials.json');

function get(environment) {
    let credentials = credentialsRep[environment];
    if (!credentials) {
        throw "No credentials found for environment " + environment;
    }
    return admin.initializeApp({
        credential: admin.credential.cert(credentials.firebaseCert),
        databaseURL: credentials.firebaseConfig.databaseURL
    });
}

module.exports = {
    get
};