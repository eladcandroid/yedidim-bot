const admin = require("firebase-admin");

module.exports = {
  init: function(cert, config) {
    admin.initializeApp({
      credential: admin.credential.cert(cert),
      databaseURL: config.databaseURL
    });
    return admin;
  }
};