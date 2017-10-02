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
          console.info('Reverse coordinates (' + coordinates + ') : \n', res);
          resolve(res);
        })
        .catch((err) => {
          console.error('Failed to reverse coordinates (' + coordinates + ') : \n', err);
          reject(err);
        });
    });
  },

  verify: function(res) {
    return ((res.length === 1 || res[0].extra.confidence > 0.9) && res[0].streetName && res[0].streetNumber && res[0].countryCode === 'IL');
  }
};
