import React, { Component } from 'react'
import Main from 'Main'
import Stores from 'Stores'
import Expo from 'expo'
import { Provider } from 'mobx-react/native'
import { addLocaleData, IntlProvider } from 'react-intl'
import en from 'react-intl/locale-data/en'
import he from 'react-intl/locale-data/he'
import localeData from './build/locales/data.json'

// Add locales
addLocaleData([...en, ...he])

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

    const language = 'he'

    return (
      <IntlProvider locale={language} messages={localeData[language]}>
        <Provider {...stores}>
          <Main isReady={isReady} />
        </Provider>
      </IntlProvider>
    )
  }
}
