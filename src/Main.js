import React, { Component } from 'react'
import AuthenticationScreen from 'screens/Authentication'
import { inject, observer } from 'mobx-react/native'
import { Root, Toast } from 'native-base'
import { injectIntl, defineMessages } from 'react-intl'
import AuthenticatedDrawer from 'layouts/AuthenticatedDrawer'

const mute = {
  [true]: defineMessages({
    text: {
      id: 'Home.alert.mute.text',
      defaultMessage: 'Notifications are muted for 24h'
    },
    buttonText: {
      id: 'Home.alert.mute.buttonText',
      defaultMessage: 'OK'
    }
  }),
  [false]: defineMessages({
    text: {
      id: 'Home.alert.unmute.text',
      defaultMessage: 'Notifications are now active'
    },
    buttonText: {
      id: 'Home.alert.mute.buttonText',
      defaultMessage: 'OK'
    }
  })
}

@observer
class Main extends Component {
  componentDidUpdate(prevProps) {
    const { isMuted, intl } = this.props
    if (typeof isMuted === 'boolean' && isMuted !== prevProps.isMuted) {
      // Muted value was changed, show toast
      Toast.show({
        text: intl.formatMessage(mute[isMuted].text),
        position: 'bottom',
        buttonText: intl.formatMessage(mute[isMuted].buttonText),
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
