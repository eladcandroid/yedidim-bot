import React, { Component } from 'react'
import { Asset, Font, AppLoading, Constants } from 'expo'
import createRootStore from 'stores/'
import { Image, I18nManager, StyleSheet } from 'react-native'
import { Provider, observer } from 'mobx-react/native'
import categoriesImages from 'const'
import Sentry from 'sentry-expo'
import { initAnalyticsTracking } from 'io/analytics'
import I18nApp from './src/I18nApp'

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

class App extends Component {
  constructor(props) {
    super(props)
    I18nManager.allowRTL(true)
    I18nManager.forceRTL(true)

    this.state = {
      isReady: false
    }
  }

  async componentWillMount() {
    initAnalyticsTracking()

    await this.loadAssetsAsync()

    // Initialiase stores
    const stores = await createRootStore()

    this.setState({ isReady: true, stores })
  }

  loadAssetsAsync = async () => {
    const imageAssets = cacheImages(categoriesImages)

    const fontAssets = Font.loadAsync({
      Roboto: require('native-base/Fonts/Roboto.ttf'), // eslint-disable-line
      Roboto_medium: require('native-base/Fonts/Roboto_medium.ttf'), // eslint-disable-line
      Ionicons: require('native-base/Fonts/Ionicons.ttf'), // eslint-disable-line
      Alef: require('./assets/fonts/Alef-Regular.ttf'), // eslint-disable-line
      AlefBold: require('./assets/fonts/Alef-Bold.ttf') // eslint-disable-line
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

export default observer(App)
