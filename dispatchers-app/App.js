import React, { Component } from 'react'
import { Provider } from 'react-redux'
import Sentry from 'sentry-expo'
import { Constants, Font } from 'expo'
import configureStore from './src/store/configureStore'
import HomeScreen from './src/components/HomeScreen'
import { getInstance } from './src/common/utils'

Sentry.config(
  'https://757d9938f3b64f20a85d536879e30e33@sentry.io/233665'
).install()
Sentry.setTagsContext({
  environment: getInstance(),
  version: Constants.manifest.version
})

const store = configureStore

class App extends Component {
  async componentWillMount() {
    await Font.loadAsync({
      Roboto: require('native-base/Fonts/Roboto.ttf'),
      Roboto_medium: require('native-base/Fonts/Roboto_medium.ttf')
    })
  }

  render() {
    return (
      <Provider store={store}>
        <HomeScreen />
      </Provider>
    )
  }
}

export default App
