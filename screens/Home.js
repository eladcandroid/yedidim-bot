import React, { Component } from "react";
import { StyleSheet, Text, View } from "react-native";
import styled from 'styled-components/native';

const StyledView = styled.View`
  flex: 1;
  background-color: #fff;
  align-items: center;
  justify-content: center;
`;

class HomeScreen extends Component {
  static navigationOptions = {
    title: "Home"
  };

  render() {
    return (
      <StyledView>
        <Text>There are no events</Text>
      </StyledView>
    );
  }
}

export default HomeScreen;
