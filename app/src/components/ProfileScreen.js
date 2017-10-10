import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { View, Text, Button } from 'react-native';
import { signOutUser } from "../actions/dataSourceActions";


class ProfileScreen extends Component {
  static navigationOptions = {
    title: 'משתמש',
  };

  render() {
    return (
      <View style={{paddingTop: 40}}>
        <Text style={{textAlign: 'right'}}>{this.props.user.name}</Text>
        <Button
          onPress={this.props.signOut.bind(this)}
          title="התנתק"/>
      </View>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    signOut: () => {
      dispatch(signOutUser());
    }
  };
};

const mapStateToProps = (state) => {
  return {
    user: state.dataSource.user,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ProfileScreen);

ProfileScreen.propTypes = {
  user: PropTypes.object,
  signOut: PropTypes.func
};