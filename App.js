import React, { Component } from 'react'
import Expo from 'expo'
import createRootStore from 'stores'
import { Provider, observer } from 'mobx-react/native'
import I18nApp from './src/I18nApp'

@observer
export default class App extends Component {
  state = {
    isReady: false
  }
  async componentWillMount() {
    await Expo.Font.loadAsync({
      Roboto: require('native-base/Fonts/Roboto.ttf'), // eslint-disable-line
      Roboto_medium: require('native-base/Fonts/Roboto_medium.ttf'), // eslint-disable-line
      Ionicons: require('native-base/Fonts/Ionicons.ttf') // eslint-disable-line
    })

    // Initialiase stores
    const stores = await createRootStore()

    this.setState({ isReady: true, stores })
  }
  render() {
    const { isReady, stores } = this.state

    if (!isReady || !stores || stores.authStore.isInitializing) {
      return <Expo.AppLoading />
    }

    return (
      <Provider stores={stores}>
        <I18nApp />
      </Provider>
    )
  }
}
