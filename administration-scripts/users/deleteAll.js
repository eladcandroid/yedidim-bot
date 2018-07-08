/*
let admin = require('./authenticators/firebaseAdmin').get('personal');

function scrollUsers(nextPageToken) {
    admin.auth().listUsers(1000, nextPageToken)
        .then(function (listUsersResult) {
            listUsersResult.users.forEach(function (userRecord) {
                admin.auth().deleteUser(userRecord.toJSON().uid);
            });
            if (listUsersResult.pageToken) {
                scrollUsers(listUsersResult.pageToken);
            }
        })
        .catch(function (error) {
            console.log("Error listing users:", error);
        });
}

scrollUsers();
*/