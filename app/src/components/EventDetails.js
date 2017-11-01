import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { View, Text, TextInput, Button, Clipboard, Alert, StyleSheet } from 'react-native';
import { Picker } from 'native-base';
import { formatEventCase, formatEventTime, getEventStatus, getEventDetailsText, getUserDetailsText } from "../common/utils";
import { EventCases, EventStatus, EventSource } from "../constants/consts";
import { createEvent, updateEventStatus } from "../actions/dataSourceActions";
import { geocodeAddress } from "../actions/geocodingActions";

class EventDetailsInputField extends Component {
  changeValue(value) {
    this.props.onChange(this.props.field, value);
  }

  render() {
    if (!this.props.editable){
      return (
        <Text style={styles.fieldValue}>{this.props.event.details[this.props.field]}</Text>
      );
    }
    return (
      <TextInput style={styles.fieldValueEditable}
                 value={this.props.state[this.props.field]}
                 onChangeText={(value) => this.changeValue(value)}/>
    );
  }
}

class EventDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {address: undefined, geo: undefined, case: 8, street_number: 0};
  }

  updateEvent(field, value) {
    this.setState({[field]: value});
  }

  createNewEvent() {
    if (!this.validateEventData()){
      return;
    }
    const event = {
      status: EventStatus.Submitted,
      source: EventSource.App,
      dispatcher: this.props.user.id,
      details: Object.assign({}, this.state)
    };
    console.log(event);
    this.props.createEvent(event);
    this.props.goBack();
  }

  async validateAddress() {
    if (!this.state.address){
      this.setState({error: {message: 'לא הוזנה כתובת', field: 'address'}});
      return false;
    }
    const location = await geocodeAddress(this.state.address);
    console.log(location);
    if (!location){
      this.setState({error: {message: 'כתובת לא חוקית', field: 'address'}});
      return false;
    }
    this.setState(location);
    return true;
  }

  validateEventData() {
    if (!this.state.geo){
      this.setState({error: {message: 'כתובת לא נבדקה', field: 'address'}});
      return false;
    }
    if (!this.state['car type']){
      this.setState({error: {message: 'לא הוזן סוג הרכב', field: 'car type'}});
      return false;
    }
    if (!this.state['phone number']){
      this.setState({error: {message: 'לא הוזן מספר טלפון', field: 'phone number'}});
      return false;
    }
    if (!/^(?:0(?!([57]))(?:[23489]))(?:-?\d){7}$|^(0(?=[57])(?:-?\d){9})$/g.test(this.state['phone number'])) {
      this.setState({error: {message: 'מספר טלפון לא חוקי', field: 'phone number'}});
      return false;
    }
    if (!this.state['caller name']){
      this.setState({error: {message: 'לא הוזן שם', field: 'caller name'}});
      return false;
    }
    return true;
  }

  showValidationError() {
    if (!this.state.error){
      return;
    }
    Alert.alert(
      'שגיאה',
      this.state.error.message,
      [
        {text: 'אישור', onPress: () => {this.setState({error: undefined})}},
      ]
    )

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

  renderEventCasePicker() {
    return (
      <Picker
        iosHeader="בעיה"
        headerBackButtonText="חזור"
        mode="dropdown"
        itemTextStyle={styles.pickerItem}
        textStyle={styles.pickerItem}
        selectedValue={this.state.case}
        onValueChange={(value) => this.setState({case: value})}
      >
        {EventCases.map((label, index) => {
          return (<Picker.Item label={label} value={index} key={index}/>);
        })}
      </Picker>
    )
  }
  renderButtonsRow(event) {
    const status = getEventStatus(event);
    switch (status) {
      case (EventStatus.Submitted):
        return (
          <View style={styles.buttonsRow}>
            <Button style={styles.button} onPress={this.sendEvent.bind(this)} title='נשלח '/>
            <Button style={styles.button} onPress={this.copyUserDetailsToClipboard.bind(this)} title='העתק טלפון'/>
            <Button style={styles.button} onPress={this.copyEventDetailsToClipboard.bind(this)} title='העתק אירוע'/>
          </View>
        );
      case (EventStatus.Sent):
        return (
          <View style={styles.buttonsRow}>
            <Button style={styles.button} onPress={this.completeEvent.bind(this)} title='טופל '/>
            <Button style={styles.button} onPress={this.copyUserDetailsToClipboard.bind(this)} title='העתק טלפון'/>
            <Button style={styles.button} onPress={this.copyEventDetailsToClipboard.bind(this)} title='העתק אירוע'/>
          </View>
        );
      case (EventStatus.Draft):
        return (
          <View style={styles.buttonsRow}>
            <Button style={styles.button} onPress={this.createNewEvent.bind(this)} title='שלח'/>
          </View>
        );
    }
  }

  render() {
    const event = this.props.event;
    const editable = this.props.editable;
    return (
      <View style={styles.container}>
        {this.showValidationError()}
        {event.timestamp ?
          <View>
            <Text style={styles.fieldName}>זמן</Text>
            <Text style={styles.fieldValue}>{formatEventTime(event)}</Text>
          </View>
          : undefined
        }
        <View>
          <Text style={styles.fieldName}>כתובת</Text>
          <EventDetailsInputField field='address' event={event} state={this.state} editable={editable} onChange={this.updateEvent.bind(this)}/>
        </View>
        {this.props.editable?
          <View>
            <Button style={styles.button} onPress={this.validateAddress.bind(this)} title='בדוק כתובת'/>
          </View>
          : undefined
        }
        <View>
          <Text style={styles.fieldName}>בעיה</Text>
          {!this.props.editable ?
            <Text style={styles.fieldValue}>{formatEventCase(event)}</Text>
            :
            this.renderEventCasePicker()
          }
        </View>
        <View>
          <Text style={styles.fieldName}>סוג רכב</Text>
          <EventDetailsInputField field='car type' event={event} state={this.state} editable={editable} onChange={this.updateEvent.bind(this)}/>
        </View>
        <View>
          <Text style={styles.fieldName}>פרטים</Text>
          <EventDetailsInputField field='more' event={event} state={this.state} editable={editable} onChange={this.updateEvent.bind(this)}/>
        </View>
        <View>
          <Text style={styles.fieldName}>טלפון</Text>
          <EventDetailsInputField field='phone number' event={event} state={this.state} editable={editable} onChange={this.updateEvent.bind(this)}/>
        </View>
        <View>
          <Text style={styles.fieldName}>שם</Text>
          <EventDetailsInputField field='caller name' event={event} state={this.state} editable={editable} onChange={this.updateEvent.bind(this)}/>
        </View>
        {this.renderButtonsRow(event)}
      </View>
    );
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    updateEventStatus: (event, status) => {
      dispatch(updateEventStatus(event, status));
    },
    createEvent: (event) => {
      dispatch(createEvent(event));
    },
    goBack: () => {
      ownProps.navigation.goBack();
    }
  };
};

const mapStateToProps = (state, ownProps) => {
  return {
    event: ownProps.navigation.state.params.event || {status: EventStatus.Draft, details: {}},
    editable: !ownProps.navigation.state.params.event,
    user: state.dataSource.user
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(EventDetails);

EventDetails.propTypes = {
  createEvent: PropTypes.func,
  updateEventStatus: PropTypes.func,
  goBack: PropTypes.func,
  user: PropTypes.object
};

const styles = StyleSheet.create({
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
    textAlign:'right'
  },
  fieldValue: {
    textAlign:'right',
    maxHeight: 50
  },
  fieldValueEditable: {
    height: 40,
    textAlign: 'right',
    borderColor: '#D3D3D3',
    borderWidth: 1
  },
  pickerItem: {
    flex: 1,
    textAlign: 'right',
  },
  buttonsRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    paddingTop: 20,
  },
  button: {
    width: 80
  }
});
