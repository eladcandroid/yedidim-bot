import React, { Component } from 'react'
import { Asset, Font, AppLoading, Constants } from 'expo'
import createRootStore from 'stores'
import { Image } from 'react-native'
import { Provider, observer } from 'mobx-react/native'
import categoriesImages from 'const'
import Sentry from 'sentry-expo'
import { initAnalyticsTracking } from 'io/analytics'
import I18nApp from './src/I18nApp'
import OneSignal from "react-native-onesignal";

// Remove this once Sentry is correctly setup.
// Sentry.enableInExpoDevelopment = true

Sentry.config(Constants.manifest.extra.SentryAPI).install()

function cacheImages(images) {
  return images.map(image => {
    if (typeof image === 'string') {
      return Image.prefetch(image)
    }
    return Asset.fromModule(image).downloadAsync()
  })
}

@observer
export default class App extends Component {
  state = {
    isReady: false
  }

  async componentWillMount() {
    OneSignal.init("2ee2bdaa-39dc-4667-99d6-e66e81af79ba");
    OneSignal.addEventListener('received', this.onReceived);
    OneSignal.addEventListener('opened', this.onOpened);
    OneSignal.addEventListener('ids', this.onIds);
    initAnalyticsTracking()

    await this.loadAssetsAsync()

    // Initialiase stores
    const stores = await createRootStore()

    this.setState({ isReady: true, stores })
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

  loadAssetsAsync = async () => {
    const imageAssets = cacheImages(categoriesImages)

    const fontAssets = Font.loadAsync({
      Roboto: require('native-base/Fonts/Roboto.ttf'), // eslint-disable-line
      Roboto_medium: require('native-base/Fonts/Roboto_medium.ttf'), // eslint-disable-line
      Ionicons: require('native-base/Fonts/Ionicons.ttf') // eslint-disable-line
    })

    await Promise.all([...imageAssets, fontAssets])
  }
  render() {
    const { isReady, stores } = this.state

    if (!isReady || !stores || stores.authStore.isInitializing) {
      return <AppLoading />
    }

    return (
      <Provider stores={stores}>
        <I18nApp />
      </Provider>
    )
  }
}
