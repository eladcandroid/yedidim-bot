import React, { Component } from 'react'
import Main from 'Main'
import Stores from 'Stores'
import Expo from 'expo'
import { Provider } from 'mobx-react/native'

// Initialiase stores
const stores = Stores()

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
      <Provider {...stores}>
        <Main isReady={isReady} />
      </Provider>
    )
  }
}
