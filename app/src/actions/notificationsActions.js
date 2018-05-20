import { Permissions, Notifications } from 'expo';
import { storeNotificationToken, setError, getFunctionsUrl } from "./dataSourceActions";
import OneSignal from "react-native-onesignal";

export function registerForPushNotifications() {
  return (async dispatch => {
    OneSignal.init("9177d83e-8dc2-4501-aef8-c18697ca6f27");

    OneSignal.addEventListener('received', (notification) => {
      console.log("Notification received: ", notification);
    });
    OneSignal.addEventListener('opened', (openResult) => {
      console.log('Message: ', openResult.notification.payload.body);
      console.log('Data: ', openResult.notification.payload.additionalData);
      console.log('isActive: ', openResult.notification.isAppInFocus);
      console.log('openResult: ', openResult);
    });
    OneSignal.addEventListener('ids', (device) => {
      dispatch(storeNotificationToken(device.userId));
    });

    OneSignal.configure();
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

export function sendTestNotificationToDispatcher(dispatcherId) {
  return new Promise((resolve, reject) => {
    const url = getFunctionsUrl() + '/sendDispatcherTestNotification';
    const params = {"dispatcherCode": dispatcherId.toString()};

    return fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params)
    })
      .then(response => {
        if (!response.ok) {
          reject("שליחת הודעה נכשלה");
        } else {
          resolve();
        }
      })
      .catch((error) => {
        reject("שליחת הודעה נכשלה");
      });
  });
}