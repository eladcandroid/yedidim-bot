import React, { Component } from "react";
import AuthenticationScreen from "./screens/Authentication";
import { AppLoading } from "expo";

// const YedidimApp = StackNavigator({
//   Splash: { screen: SplashScreen },
//   Home: { screen: HomeScreen }
// });

export default class App extends Component {
  constructor() {
    super();
    this.state = {
      isReady: false
    };
  }
  async componentWillMount() {
    await Expo.Font.loadAsync({
      Roboto: require("native-base/Fonts/Roboto.ttf"),
      Roboto_medium: require("native-base/Fonts/Roboto_medium.ttf"),
      Ionicons: require("native-base/Fonts/Ionicons.ttf")
    });
    this.setState({ isReady: true });
  }
  render() {
    const { isReady } = this.state
    if (!isReady) {
      return <AppLoading />;
    }
    // TODO Check authentication and redirect accordignally
    // return <HomeScreen />;
    return <AuthenticationScreen />;
  }
}
