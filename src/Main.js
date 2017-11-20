import React, { Component } from 'react'
import { AppLoading } from 'expo'
import AuthenticationScreen from 'screens/Authentication'
import { inject, observer } from 'mobx-react/native'
import { Root } from 'native-base'
import AuthenticatedRouter from './AuthenticatedRouter'

@observer
class Main extends Component {
  render() {
    const { isReady, isAuthenticated, isLoading } = this.props
    if (!isReady || isLoading) {
      return <AppLoading />
    }

    return (
      <Root>
        {isAuthenticated ? <AuthenticatedRouter /> : <AuthenticationScreen />}
      </Root>
    )
  }
}

export default inject(({ stores }) => ({
  isLoading: stores.authStore.isLoading,
  isAuthenticated: stores.authStore.isAuthenticated
}))(Main)
