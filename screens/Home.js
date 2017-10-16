import React, { Component } from "react";
import { StyleSheet, Text, View } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center"
  }
});

class HomeScreen extends Component {
  static navigationOptions = {
    title: "Home"
  };

  render() {
    return (
      <View style={styles.container}>
        <Text>There are no events</Text>
      </View>
    );
  }
}

export default HomeScreen;
