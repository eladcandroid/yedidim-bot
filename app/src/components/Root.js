import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import { Router, Route } from 'react-router';
import Home from "./Home";

export default class Root extends Component {
  render() {
    const { store, history } = this.props;
    return (
      <Provider store={store}>
        <Router history={history}>
          <Route path="/" component={Home}/>
        </Router>
      </Provider>
    );
  }
}

Root.propTypes = {
  store: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired
};