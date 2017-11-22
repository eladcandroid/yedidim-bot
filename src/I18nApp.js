import React, { Component } from 'react'
import { inject, observer } from 'mobx-react/native'
import { addLocaleData, IntlProvider } from 'react-intl'
import en from 'react-intl/locale-data/en'
import he from 'react-intl/locale-data/he'
import { I18nManager } from 'react-native'
import { Util } from 'expo'
import enLocaleData from '../i18n/locales/en.json'
import heLocaleData from '../i18n/locales/he.json'
import Main from './Main'

const localeData = {
  en: enLocaleData,
  he: heLocaleData
}

// Add locales
addLocaleData([...en, ...he])

@observer
class I18nApp extends Component {
  componentWillMount() {
    if (!I18nManager.isRTL) {
      I18nManager.allowRTL(true)
      I18nManager.forceRTL(true)
      Util.reload()
    }
  }

  render() {
    const { isReady } = this.props
    const language = 'en'

    return (
      <IntlProvider locale={language} messages={localeData[language]}>
        <Main isReady={isReady} />
      </IntlProvider>
    )
  }
}

export default inject(({ stores }) => ({
  isLoading: stores.authStore.isLoading,
  isAuthenticated: stores.authStore.isAuthenticated
}))(I18nApp)
