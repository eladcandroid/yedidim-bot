import React, { Component } from 'react'
import AuthenticationScreen from 'screens/Authentication'
import { inject, observer } from 'mobx-react/native'
import { Root } from 'native-base'
import { injectIntl } from 'react-intl'
import AuthenticatedDrawer from 'layouts/AuthenticatedDrawer'

@observer
class Main extends Component {
  render() {
    const { isAuthenticated, intl } = this.props

    return (
      <Root>
        {isAuthenticated ? (
          <AuthenticatedDrawer screenProps={{ intl }} />
        ) : (
          <AuthenticationScreen />
        )}
      </Root>
    )
  }
}

export default inject(({ stores }) => ({
  isAuthenticated: stores.authStore.isAuthenticated
}))(injectIntl(Main))
