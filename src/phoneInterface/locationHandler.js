import { Location } from 'expo'
import * as phonePermissionsHandler from './phonePermissionsHandler'

async function getLocationIfPermitted() {
  const hasLocationPermission = await phonePermissionsHandler.getLocationPermission()

  if (hasLocationPermission) {
    const currentLocation = await Location.getCurrentPositionAsync({})
    const { latitude, longitude } = currentLocation.coords
    return [latitude, longitude]
  }

  return null
}

export default { getLocationIfPermitted }
