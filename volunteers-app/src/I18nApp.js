import React, { Component } from 'react'
import { inject, observer } from 'mobx-react/native'
import 'intl'
import { addLocaleData, IntlProvider } from 'react-intl'
import 'intl/locale-data/jsonp/en'
// import en from 'react-intl/locale-data/en'
import 'intl/locale-data/jsonp/he'
import he from 'react-intl/locale-data/he'
// import { I18nManager } from 'react-native'
// import { Util } from 'expo'
import enLocaleData from '../i18n/locales/en.json'
import heLocaleData from '../i18n/locales/he.json'
import Main from './Main'

const localeData = {
  en: enLocaleData,
  he: heLocaleData
}

// Add locales
addLocaleData([...he])

@observer
class I18nApp extends Component {
  // componentWillMount() {
  //   // Reload app if RTL mode has changed
  //   this.updateRTL(this.props.isRTL)
  // }

  // componentWillUpdate = nextProps => {
  //   this.updateRTL(nextProps.isRTL)
  // }

  // updateRTL = nextIsRTL => {
  //   // Reload app if RTL mode has changed
  //   if (I18nManager.isRTL !== nextIsRTL) {
  //     I18nManager.allowRTL(nextIsRTL)
  //     I18nManager.forceRTL(nextIsRTL)
  //     Util.reload()
  //   }
  // }

  render() {
    const { language } = this.props

    return (
      <IntlProvider locale={language} messages={localeData[language]}>
        <Main />
      </IntlProvider>
    )
  }
}

export default inject(({ stores }) => ({
  language: stores.language,
  isRTL: stores.isRTL
}))(I18nApp)
