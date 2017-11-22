import React, { Component } from 'react'
import Expo from 'expo'
import createRootStore from 'stores'
import { Provider } from 'mobx-react/native'
import I18nMain from './src/I18nApp'

// Initialiase stores
const stores = createRootStore()

export default class App extends Component {
  state = {
    isReady: false
  }
  async componentWillMount() {
    await Expo.Font.loadAsync({
      Roboto: require('native-base/Fonts/Roboto.ttf'), // eslint-disable-line
      Roboto_medium: require('native-base/Fonts/Roboto_medium.ttf'), // eslint-disable-line
      Ionicons: require('native-base/Fonts/Ionicons.ttf'), // eslint-disable-line
    })

    this.setState({ isReady: true })
  }
  render() {
    const { isReady } = this.state

    return (
      <Provider stores={stores}>
        <I18nMain isReady={isReady} />
      </Provider>
    )
  }
}
