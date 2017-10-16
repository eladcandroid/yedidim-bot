import React, { Component } from "react";
import { StackNavigator } from "react-navigation";
import SplashScreen from "./screens/Splash";
import HomeScreen from "./screens/Home";

const YedidimApp = StackNavigator({
  Splash: { screen: SplashScreen },
  Home: { screen: HomeScreen }
});

export default class App extends Component {
  render() {
    return <YedidimApp />;
  }
}
