import React, { Component } from 'react'
import AuthenticationScreen from 'screens/Authentication'
import { inject, observer } from 'mobx-react/native'
import { Root } from 'native-base'
import AuthenticatedRouter from './AuthenticatedRouter'

@observer
class Main extends Component {
  render() {
    const { isAuthenticated } = this.props

    return (
      <Root>
        {isAuthenticated ? <AuthenticatedRouter /> : <AuthenticationScreen />}
      </Root>
    )
  }
}

export default inject(({ stores }) => ({
  isAuthenticated: stores.authStore.isAuthenticated
}))(Main)
