import React, { Component } from 'react'
import { AppLoading } from 'expo'
import AuthenticationScreen from 'Screens/Authentication'
import HomeScreen from 'Screens/Home'
import { inject, observer } from 'mobx-react/native'

// const YedidimApp = StackNavigator({
//   Splash: { screen: SplashScreen },
//   Home: { screen: HomeScreen }
// });

@observer
class Main extends Component {
  render() {
    const { isReady, isAuthenticated, isAuthenticating } = this.props
    if (!isReady || isAuthenticating) {
      return <AppLoading />
    }

    return isAuthenticated ? <HomeScreen /> : <AuthenticationScreen />
  }
}

export default inject(stores => ({
  authUser: stores.store.authUser,
  isAuthenticating: stores.store.isAuthenticating,
  isAuthenticated: stores.store.isAuthenticated
}))(Main)
