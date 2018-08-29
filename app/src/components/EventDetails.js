import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { ScrollView, View, Text, Clipboard, TouchableHighlight, Linking, StyleSheet, I18nManager } from 'react-native';
import { Button } from 'native-base';
import { Prompt } from './Prompt';
import { getTextStyle, formatEventCategory, formatEventTime, getEventStatus, getEventDetailsText, getUserDetailsText, getGoogleMapsUrl } from "../common/utils";
import { EventSource, EventStatus, ScreenType } from "../constants/consts";
import { updateEventStatus, takeEvent, assignEvent } from "../actions/dataSourceActions";
import { sendNotification } from "../actions/notificationsActions";

class EventDetails extends Component {
  constructor(props){
    super(props);
    this.state = {promptNotification: false, promptAssignment: false};
    this.copyEventDetailsToClipboard = this.copyEventDetailsToClipboard.bind(this);
    this.copyUserDetailsToClipboard = this.copyUserDetailsToClipboard.bind(this);
    this.takeEvent = this.takeEvent.bind(this);
    this.assignEvent = this.assignEvent.bind(this);
    this.openAssignmentPrompt = this.openAssignmentPrompt.bind(this);
    this.completeEvent = this.completeEvent.bind(this);
    this.openVolunteerPhone = this.openVolunteerPhone.bind(this);
    this.openAddressInMaps = this.openAddressInMaps.bind(this);
    this.openAddressInPlusCodeMaps = this.openAddressInPlusCodeMaps.bind(this);
    this.editEvent = this.editEvent.bind(this);
    this.openNotificationPrompt = this.openNotificationPrompt.bind(this);
  }

  openAddressInMaps() {
    Linking.openURL(getGoogleMapsUrl(this.props.event));
  }

  openAddressInPlusCodeMaps() {
    Linking.openURL(getGoogleMapsUrl(this.props.event, true));
  }

  copyEventDetailsToClipboard() {
    Clipboard.setString(getEventDetailsText(this.props.event, this.props.categories));
    this.props.navigate(ScreenType.EventsList);
  }

  copyUserDetailsToClipboard() {
    Clipboard.setString(getUserDetailsText(this.props.event));
    this.props.navigate(ScreenType.EventsList);
  }

  editEvent() {
    this.props.navigate(ScreenType.EventDetailsEditor, {key: this.props.event.key});
  }

  openNotificationPrompt() {
    this.setState({promptNotification : true})
  }

  sendNotification(distance) {
    distance = parseInt(distance);
    if (isNaN(distance)){
      return;
    }
    this.props.sendNotification(this.props.event.key, distance);
    if (this.props.event.source === EventSource.FB_BOT) {
      this.props.updateEventStatus(this.props.event, EventStatus.Sent);
    }
    this.setState({promptNotification : false})
  }

  openAssignmentPrompt() {
    this.setState({promptAssignment : true})
  }

  takeEvent() {
    this.props.takeEvent(this.props.event);
  }

  assignEvent(volunteer) {
    volunteer = '+972' + volunteer.substr(1);
    this.props.assignEvent(this.props.event, volunteer);
    this.props.navigate(ScreenType.EventsList);
  }

  completeEvent() {
    this.props.updateEventStatus(this.props.event, EventStatus.Completed);
    this.props.navigate(ScreenType.EventsList);
  }

  isEventAssignedToDispatcher() {
    return !!this.props.event.dispatcher;
  }

  isEventAssignedToCurrentDispatcher() {
    return this.isEventAssignedToDispatcher() && this.props.event.dispatcher === this.props.currentDispatcher;
  }

  isAllowToHandleEvent() {
    return this.props.event.source !== EventSource.FB_BOT || this.isEventAssignedToCurrentDispatcher();
  }

  renderButtonsRow() {
    const event = this.props.event;
    const status = getEventStatus(event);
    return (
      [
      <View key="row1" style={[styles.buttonsRow, I18nManager.isRTL ? {flex:1, flexDirection: 'row-reverse'} : undefined] }>
        <Button style={styles.button} onPress={this.copyEventDetailsToClipboard} disabled={!this.isAllowToHandleEvent()}><Text style={styles.buttonText}>העתק אירוע</Text></Button>
        <Button style={styles.button} onPress={this.copyUserDetailsToClipboard} disabled={!this.isAllowToHandleEvent()}><Text style={styles.buttonText}>העתק טלפון</Text></Button>
        {status === EventStatus.Submitted ?
          !this.isEventAssignedToDispatcher() ?
            <Button style={styles.button} onPress={this.takeEvent}><Text style={styles.buttonText}>טפל</Text></Button>
            :
            <Button style={styles.button} onPress={this.openAssignmentPrompt} disabled={!this.isAllowToHandleEvent()}><Text style={styles.buttonText}>הועבר</Text></Button>
          :
          <Button style={styles.button} onPress={this.completeEvent} disabled={!this.isAllowToHandleEvent()}><Text style={styles.buttonText}>טופל</Text></Button>
        }
      </View>,
      <View key="row2" style={[styles.buttonsRow, I18nManager.isRTL ? {flex:1, flexDirection: 'row-reverse'} : undefined] }>
        <Button style={styles.button} onPress={this.openNotificationPrompt} disabled={!!this.props.event.assignedTo}><Text style={styles.buttonText}>שלח התראה</Text></Button>
        <Button style={styles.button} onPress={this.editEvent} disabled={!this.isAllowToHandleEvent()}><Text style={styles.buttonText}>ערוך</Text></Button>
      </View>
      ]
    );
  }

  openVolunteerPhone() {
    if (this.props.volunteer.phone) {
      Linking.openURL('tel:' + this.props.volunteer.phone);
    }
  }

  renderAssignedToDispatcher() {
    if (this.props.dispatcher){
      return (
        <View>
          <Text style={getTextStyle(styles.fieldName)}>מוקדן</Text>
          <Text style={getTextStyle(styles.fieldValue)}>{this.props.dispatcher.name}</Text>
        </View>
      )
    }
  }

  render() {
    const { event, volunteer } = this.props;
    if (!event){
      return undefined;
    }

    return (
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.container}>
          <Text style={getTextStyle(styles.fieldName)}>זמן</Text>
          <Text style={getTextStyle(styles.fieldValue)}>{formatEventTime(event)}</Text>
          {volunteer && volunteer.assignedTo && <View>
            <Text style={getTextStyle(styles.fieldName)}>מתנדב</Text>
            <Text style={getTextStyle(styles.fieldValue)} onPress={this.openVolunteerPhone}>{volunteer.assignedTo.name} {volunteer.assignedTo.phone}</Text>
          </View>}
          {this.renderAssignedToDispatcher()}
          <Text style={getTextStyle(styles.fieldName)}>כתובת</Text>
          <TouchableHighlight onPress={this.openAddressInMaps}>
            <Text style={getTextStyle(styles.addressFieldValue)}>{event.details.address}</Text>
          </TouchableHighlight>
          {event.details.plus_code && <Text style={getTextStyle(styles.fieldName)}>מיקום דרך Plus Code</Text>}
          {event.details.plus_code && <TouchableHighlight onPress={this.openAddressInPlusCodeMaps}>
            <Text style={getTextStyle(styles.addressFieldValue)}>{event.details.plus_code}</Text>
          </TouchableHighlight>}
          <Text style={getTextStyle(styles.fieldName)}>סוג אירוע</Text>
          <Text style={getTextStyle(styles.fieldValue)}>{formatEventCategory(this.props.categories, event, true)}</Text>
          <Text style={getTextStyle(styles.fieldName)}>סוג רכב</Text>
          <Text style={getTextStyle(styles.fieldValue)}>{event.details['car type']}</Text>
          <Text style={getTextStyle(styles.fieldName)}>פרטים</Text>
          <Text style={getTextStyle(styles.fieldValue)}>{event.details['more']}</Text>
          <Text style={getTextStyle(styles.fieldName)}>מידע פרטי</Text>
          <Text style={getTextStyle(styles.fieldValue)}>{event.details['private_info']}</Text>
          <Text style={getTextStyle(styles.fieldName)}>טלפון</Text>
          <Text style={getTextStyle(styles.fieldValue)}>{event.details['phone number']}</Text>
          <Text style={getTextStyle(styles.fieldName)}>שם</Text>
          <Text style={getTextStyle(styles.fieldValue)}>{event.details['caller name']}</Text>
          {this.renderButtonsRow()}
        </View>
        <Prompt
          title='הכנס מרחק בק״מ'
          defaultValue="5"
          visible={this.state.promptNotification}
          submitText='שלח'
          cancelText='בטל'
          onSubmit={(distance) => this.sendNotification(distance)}
          onCancel={() => this.setState({promptNotification: false})}
        />
        <Prompt
          title='הכנס טלפון של המתנדב'
          defaultValue=""
          visible={this.state.promptAssignment}
          submitText='עדכן'
          cancelText='בטל'
          onSubmit={(volunteer) => this.assignEvent(volunteer)}
          onCancel={() => this.setState({promptAssignment: false})}
        />
      </ScrollView>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    updateEventStatus: (event, status) => {
      dispatch(updateEventStatus(event, status));
    },
    takeEvent: (event) => {
      dispatch(takeEvent(event));
    },
    assignEvent: (event, volunteer) => {
      dispatch(assignEvent(event, volunteer));
    },
    sendNotification: (eventKey, distance) => {
      dispatch(sendNotification(eventKey, distance));
    }
  };
};

const mapStateToProps = (state, ownProps) => {
  let event = state.dataSource.events ? state.dataSource.events.find(event => event.key === ownProps.params.key) : undefined;
  if (!event) {
    event =  state.dataSource.searchEvents.find(event => event.key === ownProps.params.key)
  }
  let volunteer = (event && event.assignedTo && state.dataSource.volunteers) ?
    state.dataSource.volunteers.find(volunteer => volunteer.key === event.assignedTo)
    : undefined;
  if (!volunteer){
    volunteer = {assignedTo: event.assignedTo};
  }
  let dispatcher = (event && event.dispatcher && state.dataSource.dispatchers) ?
    state.dataSource.dispatchers.find(dispatcher => dispatcher.id === event.dispatcher)
    : undefined;

  const currentDispatcher = state.dataSource.user ? state.dataSource.user.id : undefined;

  const categories = state.dataSource.categories || [];

  return {
    event,
    currentDispatcher,
    dispatcher,
    volunteer,
    categories
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(EventDetails);

EventDetails.propTypes = {
  updateEventStatus: PropTypes.func,
  takeEvent: PropTypes.func,
  assignEvent: PropTypes.func,
  sendNotification: PropTypes.func,
  event: PropTypes.object,
  currentDispatcher: PropTypes.string,
  dispatcher: PropTypes.object,
  volunteer: PropTypes.object,
  categories: PropTypes.array
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
    paddingTop: 10,
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
