const NodeGeocoder = require('node-geocoder');

let googleGeocoder;
let osmGeocoder;

module.exports = {
  init: function(apiKey){
    const googleOptions = {
      provider: 'google',
      httpAdapter: 'https',
      language: 'iw',
      apiKey: apiKey,
      formatter: null
    };
    googleGeocoder = NodeGeocoder(googleOptions);
    const osmOptions = {
      provider: 'openstreetmap',
      httpAdapter: 'https',
      language: 'he',
      formatter: null
    };
    osmGeocoder = NodeGeocoder(osmOptions);
  },
  geocode: function(address){
    return new Promise((resolve, reject) => {
      googleGeocoder.geocode(address)
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
      googleGeocoder.reverse(coordinates)
        .then((res) => {
          console.info('Reverse coordinates w/ Google', JSON.stringify(coordinates), res);
          resolve(res);
        })
        .catch((err) => {
          if (err.message.includes('ZERO_RESULTS')){
            console.info('Failed to reverse coordinates w/ Google - trying w/ OSM', JSON.stringify(coordinates));
            osmGeocoder.reverse(coordinates)
              .then((res) => {
                console.info('Reverse coordinates w/ OSM', JSON.stringify(coordinates), res);
                if (!res[0].city || !res[0].streetName){
                  reject();
                } else {
                  res[0].formattedAddress = res[0].streetName + (res[0].streetNumber ? (' ' + res[0].streetNumber) : '') + ', ' + res[0].city;
                  resolve(res);
                }
              })
              .catch((err) => {
                console.error('Failed to reverse w/ OSM', JSON.stringify(coordinates), err);
                reject(err);
              });
          } else {
            console.error('Failed to reverse coordinates w/ Google', JSON.stringify(coordinates), err);
            reject(err);
          }
        });
    });
  },

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
