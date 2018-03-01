import { Permissions, Notifications } from 'expo';
import { storeNotificationToken, setError, getFunctionsUrl } from "./dataSourceActions";

export function registerForPushNotifications() {
  return (async dispatch => {
    const {existingStatus} = await Permissions.getAsync(Permissions.NOTIFICATIONS);
    let finalStatus = existingStatus;

    // only ask if permissions have not already been determined, because
    // iOS won't necessarily prompt the user a second time.
    if (existingStatus !== 'granted') {
      // Android remote notification permissions are granted during the app
      // install, so this will only ask on iOS
      const {status} = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      finalStatus = status;
    }

    // Stop here if the user did not grant permissions
    if (finalStatus !== 'granted') {
      return;
    }

    // Get the token that uniquely identifies this device
    let token = await Notifications.getExpoPushTokenAsync();

    console.log(token);
    dispatch(storeNotificationToken(token));
  })
}

export function sendNotification(eventKey, distance, volunteer)  {
  return (dispatch) => {
    const url = getFunctionsUrl() + '/' + (volunteer ? 'sendNotificationToRecipient' : 'sendNotificationBySearchRadius');
    const params = volunteer ?
      {"recipient": volunteer, "eventId" : eventKey}
      :
      {"searchRadius": distance, "eventId" : eventKey};

    fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params)
    })
      .then(response => {
        if (!response.ok) {
          dispatch(setError("שליחת הודעה נכשלה"));
        }
      })
      .catch((error) => {
        dispatch(setError("שליחת הודעה נכשלה", error));
      });
  }
}