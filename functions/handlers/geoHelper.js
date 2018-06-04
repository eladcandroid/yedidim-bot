
let GeoFire = require('geofire');

exports.saveLocation = (collectionName,admin, key, location) => {
    let geoFire = new GeoFire(admin.database().ref(collectionName));
    return geoFire.set(key, location).then(() => {
      console.log('added geo index for ' + collectionName + "/" + key);
    }).catch(error => {
        console.log(error);
    });
};

exports.removeLocation = (collectionName,admin, key) => {
  let geoFire = new GeoFire(admin.database().ref(collectionName));
  return geoFire.remove(key).then(() => {
    console.log('removed geo index for ' + collectionName + "/" + key);
  }).catch(error => {
    console.log(error);
  });
};