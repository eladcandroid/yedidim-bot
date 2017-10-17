import React, { Component } from "react";
import { NavigationActions } from "react-navigation";
import { AppLoading } from 'expo';

class SplashScreen extends Component {
  static navigationOptions = {
    header: null
  };

  componentDidMount() {
    setTimeout(() => {
      this.props.navigation.dispatch(
        NavigationActions.reset({
          index: 0,
          actions: [NavigationActions.navigate({ routeName: "Home" })]
        })
      );
    }, 3000);
  }

  render() {
    return (
      <AppLoading/>
    );
  }
}

export default SplashScreen;
