const firebase = require('../authenticators/firebase.js');

firebase.auth().signInWithEmailAndPassword('+9722494193@yedidim.org', '203814124')
    .then(user => {
        console.log(user);
    });

