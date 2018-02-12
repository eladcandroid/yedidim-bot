
let GeoFire = require('geofire');

exports.saveLocation = (collectionName,admin, key, location) => {
    let geoFire = new GeoFire(admin.database().ref(collectionName));
    return geoFire.set(key, location).then(() => {
        console.log('Update succesfull');
    }).catch(error => {
        console.log(error);
    });
};