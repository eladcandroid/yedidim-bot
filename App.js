import React, { Component } from 'react'
import firebase from 'firebase'
import Main from 'Main'
import Stores from 'Stores'
import Expo, { Constants } from 'expo'
import { Provider } from 'mobx-react/native'
import Config from './Config.json'

// Initialise firebase
const fbApp = firebase.initializeApp(
  Config.firebase[Constants.manifest.extra.instance]
)

const stores = Stores(fbApp)

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
