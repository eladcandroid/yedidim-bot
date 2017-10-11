import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { View, Text, Button, StyleSheet } from 'react-native';
import { signOutUser } from "../actions/dataSourceActions";


class ProfileScreen extends Component {
  static navigationOptions = {
    title: 'משתמש',
  };

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.field}>{this.props.user.name}</Text>
        <Button
          onPress={this.props.signOut.bind(this)}
          title="התנתק"
        />
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

const styles = StyleSheet.create({
  container: {
    paddingTop: 40,
    paddingRight: 20
  },
  field: {
    fontSize: 16,
    textAlign: 'right',
    paddingBottom: 20
  },
  button: {
    width: 100
  }
});