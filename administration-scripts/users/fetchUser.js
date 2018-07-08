let app = require('../authenticators/firebaseAdmin.js');

app.auth().getUserByEmail('+9722494193@yedidim.org')
    .then(function (userRecord) {
        console.log(userRecord.toJSON());
    });
