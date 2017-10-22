import React, { Component } from 'react';
import { Provider } from 'react-redux';
import Sentry from 'sentry-expo';
import configureStore from '../store/configureStore';
import HomeScreen from "../components/HomeScreen";

Sentry.config('https://757d9938f3b64f20a85d536879e30e33@sentry.io/233665').install();

const store = configureStore;

class App extends Component {
  render() {
    return (
      <Provider store={store} >
        <HomeScreen />
      </Provider>);
  }
}

export default App;
