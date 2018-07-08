const firebase = require('firebase');
let credentialsRep = require('./credentials.json');

function get(environment) {
    let credentials = credentialsRep[environment];
    if (!credentials) {
        throw "No credentials found for environment " + environment;
    }
    return firebase.initializeApp(credentials.firebaseConfig);
}

module.exports = {
    get
};