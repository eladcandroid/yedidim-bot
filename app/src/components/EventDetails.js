import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { ScrollView, View, Text, Clipboard, TouchableHighlight, Linking, StyleSheet, I18nManager } from 'react-native';
import { Button } from 'native-base';
import { getTextStyle, formatEventCase, formatEventTime, getEventStatus, getEventDetailsText, getUserDetailsText, getGoogleMapsUrl } from "../common/utils";
import { EventStatus } from "../constants/consts";
import { updateEventStatus } from "../actions/dataSourceActions";

class EventDetails extends Component {
  openAddressInMaps() {
    Linking.openURL(getGoogleMapsUrl(this.props.event));
  }

  copyEventDetailsToClipboard() {
    Clipboard.setString(getEventDetailsText(this.props.event));
    this.props.goBack();
  }

  copyUserDetailsToClipboard() {
    Clipboard.setString(getUserDetailsText(this.props.event));
    this.props.goBack();
  }

  sendEvent() {
    this.props.updateEventStatus(this.props.event, EventStatus.Sent);
    this.props.goBack();
  }

  completeEvent() {
    this.props.updateEventStatus(this.props.event, EventStatus.Completed);
    this.props.goBack();
  }

  renderButtonsRow(event) {
    const status = getEventStatus(event);
    return (
      <View style={[styles.buttonsRow, I18nManager.isRTL ? {flexDirection: 'row-reverse'} : undefined] }>
        <Button style={styles.button} onPress={this.copyEventDetailsToClipboard.bind(this)}><Text style={styles.buttonText}>העתק אירוע</Text></Button>
        <Button style={styles.button} onPress={this.copyUserDetailsToClipboard.bind(this)}><Text style={styles.buttonText}>העתק טלפון</Text></Button>
        {status === EventStatus.Submitted ?
          <Button style={styles.button} onPress={this.sendEvent.bind(this)}><Text style={styles.buttonText}>הועבר</Text></Button>
          :
          <Button style={styles.button} onPress={this.completeEvent.bind(this)}><Text style={styles.buttonText}>טופל</Text></Button>
        }
      </View>
    );
  }

  render() {
    const event = this.props.event;
    return (
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.container}>
          <Text style={getTextStyle(styles.fieldName)}>זמן</Text>
          <Text style={getTextStyle(styles.fieldValue)}>{formatEventTime(event)}</Text>
          <Text style={getTextStyle(styles.fieldName)}>כתובת</Text>
          <TouchableHighlight onPress={this.openAddressInMaps.bind(this)}>
            <Text style={getTextStyle(styles.addressFieldValue)}>{event.details.address}</Text>
          </TouchableHighlight>
          <Text style={getTextStyle(styles.fieldName)}>בעיה</Text>
          <Text style={getTextStyle(styles.fieldValue)}>{formatEventCase(event)}</Text>
          <Text style={getTextStyle(styles.fieldName)}>סוג רכב</Text>
          <Text style={getTextStyle(styles.fieldValue)}>{event.details['car type']}</Text>
          <Text style={getTextStyle(styles.fieldName)}>פרטים</Text>
          <Text style={getTextStyle(styles.fieldValue)}>{event.details['more']}</Text>
          <Text style={getTextStyle(styles.fieldName)}>טלפון</Text>
          <Text style={getTextStyle(styles.fieldValue)}>{event.details['phone number']}</Text>
          <Text style={getTextStyle(styles.fieldName)}>שם</Text>
          <Text style={getTextStyle(styles.fieldValue)}>{event.details['caller name']}</Text>
          {this.renderButtonsRow(event)}
        </View>
      </ScrollView>
    );
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    updateEventStatus: (event, status) => {
      dispatch(updateEventStatus(event, status));
    },
    goBack: () => {
      ownProps.navigation.goBack();
    }
  };
};

const mapStateToProps = (state, ownProps) => {
  const event = state.dataSource.events ? state.dataSource.events.find(event => event.key === ownProps.navigation.state.params.key) : undefined;
  return {
    event: event || {status: EventStatus.Draft, details: {}},
    user: state.dataSource.user
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(EventDetails);

EventDetails.propTypes = {
  updateEventStatus: PropTypes.func,
  goBack: PropTypes.func,
  user: PropTypes.object
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: 'white'
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    paddingTop: 20,
    paddingRight: 8,
    paddingBottom: 10,
    paddingLeft: 8,
    backgroundColor: 'white'
  },
  fieldName: {
    fontWeight: 'bold',
    paddingTop: 10
  },
  fieldValue: {
    maxHeight: 50,
    paddingTop: 5
  },
  addressFieldValue: {
    maxHeight: 50,
    paddingTop: 5,
    backgroundColor: 'white',
    textDecorationLine: 'underline'
  },
  pickerItem: {
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  buttonsRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    paddingTop: 20,
  },
  button: {
    width: 100,
    justifyContent: 'center'
  },
  buttonText: {
    color: 'white',
    alignSelf:'center'
  }
});
