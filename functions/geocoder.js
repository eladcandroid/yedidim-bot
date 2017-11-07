const NodeGeocoder = require('node-geocoder');

let nodeGeocoder;

module.exports = {
  init: function(apiKey){
    const options = {
      provider: 'google',
      httpAdapter: 'https',
      language: 'iw',
      apiKey: apiKey,
      formatter: null
    };
    nodeGeocoder = NodeGeocoder(options);
  },
  geocode: function(address){
    return new Promise((resolve, reject) => {
      nodeGeocoder.geocode(address)
        .then((res) => {
          console.info('Geocoding (' + address + ') : \n', res);
          resolve(res);
        })
        .catch((err) => {
          console.error('Failed to geocode (' + address + ') : \n', err);
          reject(err);
        });
    });
  },

  reverse: function(coordinates) {
    return new Promise((resolve, reject) => {
      nodeGeocoder.reverse(coordinates)
        .then((res) => {
          console.info('Reverse coordinates', JSON.stringify(coordinates), res);
          resolve(res);
        })
        .catch((err) => {
          console.error('Failed to reverse coordinates', JSON.stringify(coordinates) , err);
          reject(err);
        });
    });
  },

  // geoReverse: function(coordinates) {
  //   return new Promise((resolve, reject) => {
  //     request({
  //       uri: 'https://api.mapbox.com/geocoding/v5/mapbox.places/' + coordinates.lon + ',' + coordinates.lat + ".json",
  //       qs: {
  //         access_token: _accessToken,
  //         language: 'he'
  //       },
  //       method: 'GET'
  //     }, function (error, response, body) {
  //       if (!error && response.statusCode === 200) {
  //         console.info('Reverse coordinates', coordinates, body);
  //         const location = body.features[0];
  //         const res = [{formattedAddress: location.place_name_he,
  //           latitude:geometry.coordinates[1],
  //           longitude:geometry.coordinates[0]}];
  //         resolve(res);
  //       } else {
  //         console.error('Failed to reverse coordinates', coordinates, error, body);
  //         reject(error);
  //       }
  //     });
  //   });
  // },

  verify: function(res) {
    if (res.length < 1){
      return false;
    }
    if (!res[0].countryCode) {
      return ((res.length === 1 || res[0].extra.confidence > 0.9) && res[0].streetName);
    }
    if (res[0].countryCode === 'IL'){
      return ((res.length === 1 || res[0].extra.confidence > 0.9) && res[0].streetName && res[0].streetNumber);
    }
    return false;
  },

  toAddress: function(res) {
    return {city: res[0].city, streetName: res[0].streetName, streetNumber: res[0].streetNumber ? res[0].streetNumber : 0, formattedAddress: res[0].formattedAddress};
  }
};
