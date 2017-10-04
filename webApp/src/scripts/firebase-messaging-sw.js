/*global importScripts */
/*global firebase */

// importScripts('/__/firebase/3.9.0/firebase-app.js');
// importScripts('/__/firebase/3.9.0/firebase-messaging.js');
// importScripts('/__/firebase/init.js');

importScripts('https://www.gstatic.com/firebasejs/3.9.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/3.9.0/firebase-messaging.js');

firebase.initializeApp({
  'messagingSenderId': '918819260524'
});

const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(function(payload) {
  // console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const notificationTitle = payload.title;
  const notificationOptions = {
    body: payload.body,
    icon: payload.icon
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});