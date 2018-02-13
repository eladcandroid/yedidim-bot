import firebase from 'firebase'
import GeoFire from 'geofire'

async function saveUserLocation(userId, latitude, longitude) {
  try {
    const geoFire = new GeoFire(firebase.database().ref('user_location'))
    await geoFire.set(userId, [latitude, longitude])
  } catch (e) {
    // TODO: error logging?
    console.error(e)
  }
}

export default saveUserLocation
