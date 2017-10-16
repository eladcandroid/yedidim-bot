import React, { Component } from "react";
import { StyleSheet, Text, View } from "react-native";
import { NavigationActions } from "react-navigation";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "red",
    alignItems: "center",
    justifyContent: "center"
  }
});

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
      <View style={styles.container}>
        <Text>This is the splash screen</Text>
      </View>
    );
  }
}

export default SplashScreen;
