import React, { Component } from 'react';
import { StackNavigator } from 'react-navigation';
import SplashScreen from './screens/Splash'

const SimpleApp = StackNavigator({
  Splash: { screen: SplashScreen }
});

export default class App extends Component {
  render() {
    return (
      <SimpleApp />
    );
  }
}
