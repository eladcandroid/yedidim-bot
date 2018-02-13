import { Permissions } from 'expo'

async function getPermissionWithExpo(expoPermission) {
  const { status: existingStatus } = await Permissions.getAsync(expoPermission)
  let finalStatus = existingStatus
  // only ask if permissions have not already been determined, because
  // iOS won't necessarily prompt the user a second time.
  if (existingStatus !== 'granted') {
    // Android remote notification permissions are granted during the app
    // install, so this will only ask on iOS
    const { status } = await Permissions.askAsync(expoPermission)
    finalStatus = status
  }
  return finalStatus === 'granted'
}

async function getLocationPermission() {
  return getPermissionWithExpo(Permissions.LOCATION)
}

async function getNotificationsPermission() {
  return getPermissionWithExpo(Permissions.NOTIFICATIONS)
}

export { getLocationPermission, getNotificationsPermission }
