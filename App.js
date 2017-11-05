import React, { Component } from 'react'
import Expo, { AppLoading } from 'expo'
import AuthenticationScreen from 'Screens/Authentication'

// const YedidimApp = StackNavigator({
//   Splash: { screen: SplashScreen },
//   Home: { screen: HomeScreen }
// });

export default class App extends Component {
  state = {
    isReady: false
  }
  async componentWillMount() {
    await Expo.Font.loadAsync({
      Roboto: require('native-base/Fonts/Roboto.ttf'), // eslint-disable-line
      Roboto_medium: require('native-base/Fonts/Roboto_medium.ttf'), // eslint-disable-line
      Ionicons: require('native-base/Fonts/Ionicons.ttf'), // eslint-disable-line
    })
    this.setState({ isReady: true })
  }
  render() {
    const { isReady } = this.state
    if (!isReady) {
      return <AppLoading />
    }
    // TODO Check authentication and redirect accordignally
    // return <HomeScreen />;
    return <AuthenticationScreen />
  }
}
