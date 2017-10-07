import React, { Component } from 'react';
import { Provider } from 'react-redux';
import configureStore from '../store/configureStore';
import HomeScreen from "../components/HomeScreen";

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
