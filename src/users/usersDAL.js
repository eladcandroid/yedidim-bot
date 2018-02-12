import firebase from 'firebase'
import GeoFire from 'geofire'

export { saveUserLocation }

async function saveUserLocation(userId, latitude, longitude) {
  try {
    let geoFire = new GeoFire(firebase.database().ref('user_location'))
    await geoFire.set(userId, [latitude, longitude])
  } catch (e) {
    // TODO: error logging?
    console.error(e)
  }
}
