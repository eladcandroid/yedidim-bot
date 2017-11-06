import React, { Component } from 'react'
import { AppLoading } from 'expo'
import AuthenticationScreen from 'Screens/Authentication'
import { inject, observer } from 'mobx-react/native'
import { Root } from 'native-base'
import AuthenticatedRouter from './AuthenticatedRouter'

@observer
class Main extends Component {
  render() {
    const { isReady, isAuthenticated, isAuthenticating } = this.props
    if (!isReady || isAuthenticating) {
      return <AppLoading />
    }

    return (
      <Root>
        {isAuthenticated ? <AuthenticatedRouter /> : <AuthenticationScreen />}
      </Root>
    )
  }
}

export default inject(({ Authentication }) => ({
  isAuthenticating: Authentication.isAuthenticating,
  isAuthenticated: Authentication.isAuthenticated
}))(Main)
