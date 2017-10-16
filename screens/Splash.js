import React, { Component } from "react";
import { Text, View } from "react-native";
import { NavigationActions } from "react-navigation";
import styled from 'styled-components/native';

const StyledView = styled.View`
    flex: 1;
    background-color: red;
    align-items: center;
    justify-content: center;
`;

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
      <StyledView>
        <Text>This is the splash screen</Text>
      </StyledView>
    );
  }
}

export default SplashScreen;
