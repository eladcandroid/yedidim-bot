import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { View, Text, Button, Switch, StyleSheet, I18nManager } from 'react-native';
import { InstanceTypes } from "../constants/consts";
import {enableNotifications, sendTestNotificationToSelf, signOutUser} from "../actions/dataSourceActions";
import { getTextStyle } from "../common/utils";

class ProfileScreen extends Component {
  render() {
    return (
      <View style={styles.container}>
        <View style={[styles.row, I18nManager.isRTL ? {flexDirection: 'row'} : {flexDirection: 'row-reverse'}]}>
          <Text style={getTextStyle(styles.field)}>שם</Text>
          <Text style={getTextStyle(styles.field)}>{this.props.user.name}</Text>
        </View>
        <View style={[styles.row, I18nManager.isRTL ? {flexDirection: 'row'} : {flexDirection: 'row-reverse'}]}>
          <Text style={getTextStyle(styles.field)}>קבל התראות</Text>
          <Switch value={this.props.user.notifications} onValueChange={this.props.enableNotifications.bind(this)}/>
        </View>
        <View style={[styles.row, I18nManager.isRTL ? {flexDirection: 'row'} : {flexDirection: 'row-reverse'}]}>
          <Text style={getTextStyle(styles.field)}>גירסא</Text>
          <Text style={getTextStyle(styles.field)}>{this.props.version}</Text>
        </View>
        {this.props.instance !== InstanceTypes.Production ?
          <View style={[styles.row, I18nManager.isRTL ? {flexDirection: 'row'} : {flexDirection: 'row-reverse'}]}>
            <Text style={getTextStyle(styles.field)}>מערכת</Text>
            <Text style={getTextStyle(styles.field)}>{this.props.instance}</Text>
          </View>
          : undefined
        }
        <View style={styles.buttonRow}>
          <Button onPress={this.props.sendTestNotification.bind(this)} title="בדוק התראות"/>
        </View>
        <View style={styles.buttonRow}>
          <Button onPress={this.props.signOut.bind(this)} title="התנתק"/>
        </View>
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
    },
    sendTestNotification: () => {
      dispatch(sendTestNotificationToSelf());
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
  signOut: PropTypes.func,
  sendTestNotification: PropTypes.func
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 70,
    paddingRight: 20
  },
  field: {
    fontSize: 16,
    paddingBottom: 20,
    width: 130
  },
  row: {
    paddingBottom: 20,
  },
  switch : {
    alignContent: 'flex-end'
  },
  buttonRow: {
    alignContent: 'center',
    paddingTop: 20,
    paddingRight: 40,
    paddingLeft: 40
  },
  button: {
    width: 100
  }
});