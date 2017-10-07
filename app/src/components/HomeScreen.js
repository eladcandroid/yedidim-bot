import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import LoginScreen from "./LoginScreen";
import EventsScreen from "./EventsScreen";
import { checkUserAuth } from "../actions/dataSourceActions";


class HomeScreen extends Component {
  componentWillMount() {
    this.props.checkUserAuth();
  }

  render() {
    //User authentication was not checked it
    if (!this.props.user) {
      return (<Expo.AppLoading />)
    }
    //There is no log in user
    if (!this.props.user.id) {
      return (<LoginScreen/>);
    }
    //Events data was not loaded yet
    if (!this.props.events) {
      return (<Expo.AppLoading />)
    }
    return (<EventsScreen/>)
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    checkUserAuth: () => {
      dispatch(checkUserAuth());
    }
  };
};

const mapStateToProps = (state) => {
  return {
    user: state.dataSource.user,
    events: state.dataSource.events
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(HomeScreen);

HomeScreen.propTypes = {
  user: PropTypes.object};