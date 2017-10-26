import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { View, Text, Button, Switch, StyleSheet } from 'react-native';
import { InstanceTypes } from "../constants/consts";
import { enableNotifications, signOutUser } from "../actions/dataSourceActions";


class ProfileScreen extends Component {
  static navigationOptions = {
    title: 'משתמש',
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.row}>
          <Text style={styles.field}>שם</Text>
          <Text style={styles.field}>{this.props.user.name}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.field}>קבל התראות</Text>
          <Switch value={this.props.user.notifications} onValueChange={this.props.enableNotifications.bind(this)}/>
        </View>
        <View style={styles.row}>
          <Text style={styles.field}>גירסא</Text>
          <Text style={styles.field}>{this.props.version}</Text>
        </View>
        {this.props.instance !== InstanceTypes.Production ?
          <View style={styles.row}>
            <Text style={styles.field}>מערכת</Text>
            <Text style={styles.field}>{this.props.instance}</Text>
          </View>
          : undefined
        }
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
    enableNotifications: (enable) => {
      dispatch(enableNotifications(enable));
    },
    signOut: () => {
      dispatch(signOutUser());
    }
  };
};

const mapStateToProps = (state) => {
  return {
    instance: state.dataSource.instance,
    version: state.dataSource.version,
    user: state.dataSource.user
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ProfileScreen);

ProfileScreen.propTypes = {
  instance: PropTypes.string,
  version: PropTypes.string,
  user: PropTypes.object,
  enableNotifications: PropTypes.func,
  signOut: PropTypes.func
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 70,
    paddingRight: 20
  },
  field: {
    fontSize: 16,
    textAlign: 'right',
    paddingBottom: 20,
    width: 130
  },
  row: {
    fontSize: 16,
    flexDirection: 'row-reverse',
    paddingBottom: 20,
  },
  switch : {
    alignContent: 'right'
  },
  button: {
    width: 100
  }
});