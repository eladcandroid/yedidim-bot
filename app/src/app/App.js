import React, { Component } from 'react';
import { Provider } from 'react-redux';
import Sentry from 'sentry-expo';
import configureStore from '../store/configureStore';
import HomeScreen from "../components/HomeScreen";
import { getInstance } from "../common/utils";

Sentry.config('https://757d9938f3b64f20a85d536879e30e33@sentry.io/233665').install();
Sentry.setTagsContext({"environment": getInstance()});

const store = configureStore;

class App extends Component {

  async componentWillMount() {
    await Expo.Font.loadAsync({
      Roboto: require('native-base/Fonts/Roboto.ttf'), // eslint-disable-line
      Roboto_medium: require('native-base/Fonts/Roboto_medium.ttf'), // eslint-disable-line
      Ionicons: require('native-base/Fonts/Ionicons.ttf') // eslint-disable-line
    })
  }

  render() {
    return (
      <Provider store={store} >
        <HomeScreen />
      </Provider>);
  }
}

export default App;
