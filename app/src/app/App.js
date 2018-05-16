import React, { Component } from 'react';
import { Provider } from 'react-redux';
import Sentry from 'sentry-expo';
import configureStore from '../store/configureStore';
import HomeScreen from "../components/HomeScreen";
import { getInstance } from "../common/utils";
import OneSignal from "react-native-onesignal";

Sentry.config('https://757d9938f3b64f20a85d536879e30e33@sentry.io/233665').install();
Sentry.setTagsContext({'environment': getInstance(), 'version': Expo.Constants.manifest.version});

const store = configureStore;

class App extends Component {

  async componentWillMount() {

    OneSignal.init("9177d83e-8dc2-4501-aef8-c18697ca6f27");
    OneSignal.addEventListener('received', this.onReceived);
    OneSignal.addEventListener('opened', this.onOpened);
    OneSignal.addEventListener('ids', this.onIds);

    await Expo.Font.loadAsync({
      Roboto: require('native-base/Fonts/Roboto.ttf'), // eslint-disable-line
      Roboto_medium: require('native-base/Fonts/Roboto_medium.ttf'), // eslint-disable-line
      Ionicons: require('native-base/Fonts/Ionicons.ttf') // eslint-disable-line
    })
  }

  componentWillUnmount() {
    OneSignal.removeEventListener('received', this.onReceived);
    OneSignal.removeEventListener('opened', this.onOpened);
    OneSignal.removeEventListener('ids', this.onIds);
  }

  onReceived(notification) {
    console.log("Notification received: ", notification);
  }

  onOpened(openResult) {
    console.log('Message: ', openResult.notification.payload.body);
    console.log('Data: ', openResult.notification.payload.additionalData);
    console.log('isActive: ', openResult.notification.isAppInFocus);
    console.log('openResult: ', openResult);
  }

  onIds(device) {
    console.log('Device info: ', device);
  }

  render() {
    return (
      <Provider store={store} >
        <HomeScreen />
      </Provider>);
  }
}

export default App;
