import React, { Component } from 'react'
import AuthenticationScreen from 'screens/Authentication'
import { inject, observer } from 'mobx-react/native'
import { Root } from 'native-base'
import { injectIntl } from 'react-intl'
import AuthenticatedDrawer from 'layouts/AuthenticatedDrawer'

@observer
class Main extends Component {
  render() {
    const { isAuthenticated, ...screenProps } = this.props

    return (
      <Root>
        {isAuthenticated ? (
          <AuthenticatedDrawer screenProps={screenProps} />
        ) : (
          <AuthenticationScreen />
        )}
      </Root>
    )
  }
}

export default inject(({ stores }) => ({
  isAuthenticated: stores.authStore.isAuthenticated,
  toggleMute:
    stores.authStore.currentUser && stores.authStore.currentUser.toggleMute,
  isMuted: stores.authStore.currentUser && stores.authStore.currentUser.isMuted
}))(injectIntl(Main))
