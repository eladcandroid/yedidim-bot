import React, { Component } from 'react'
import AuthenticationScreen from 'screens/Authentication'
import { inject, observer } from 'mobx-react/native'
import { Root, Toast } from 'native-base'
import { injectIntl, defineMessages } from 'react-intl'
import AuthenticatedDrawer from 'layouts/AuthenticatedDrawer'

@observer
class Main extends Component {
  componentDidUpdate(prevProps) {
    const { isMuted } = this.props
    if (isMuted !== prevProps.isMuted) {
      // Muted value was changed, show toast
      Toast.show({
        text: isMuted
          ? 'Notifications are muted for 24h'
          : 'Notifications are now active',
        position: 'bottom',
        buttonText: 'OK',
        duration: 10000,
        type: isMuted ? 'danger' : 'success'
      })
    }
  }

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
