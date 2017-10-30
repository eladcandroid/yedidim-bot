import { Location } from 'expo';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { View, Text, TextInput, Button, Clipboard, Alert, StyleSheet } from 'react-native';
import { formatEventCase, formatEventTime, getEventStatus, getEventDetailsText, getUserDetailsText } from "../common/utils";
import { EventStatus } from "../constants/consts";
import { createEvent, updateEventStatus } from "../actions/dataSourceActions";

class EventDetailsInputField extends Component {
  constructor(props) {
    super(props);
    this.state = {value: undefined};
  }

  changeValue(value) {
    this.setState({value});
    if (this.props.onChange) {
      this.props.onChange(value);
    }
  }

  render() {
    if (!this.props.editable){
      return (
        <Text style={styles.fieldValue}>{this.props.value}</Text>
      );
    }
    return (
      <TextInput style={styles.fieldValueEditable}
                 value={this.state.value}
                 onChangeText={(value) => this.changeValue(value)}/>
    );
  }
}

class EventDetails extends Component {
  constructor(props) {
    super(props);
    //TODO set API key
    // Expo.Location.setApiKey(apiKey)
    this.state = {city: undefined, carType: undefined};
  }

  updateEvent(field, value) {
    this.setState({[field]: value});
  }

  createNewEvent() {
    if (!this.validateEventData()){
      return;
    }
    const address = this.state.address.split(' ');
    let event = {
      status: EventStatus.Draft,
      details: {
        city: this.state.city,
        street_name: address[0],
        street_number: address[1],
        'car type': this.state.carType,
        more: this.state.more,
        'phone number': this.state.phone,
        'caller name': this.state.name,
      }
    };
    console.log(event);
    // this.props.createEvent(event);
    this.props.goBack();
  }

  async validateAddress() {
    if (!this.state.city){
      this.setState({error: {message: 'לא הוזנה עיר', field: 'city'}});
      return false;
    }
    if (!this.state.address){
      this.setState({error: {message: 'לא הוזנה כתובת', field: 'address'}});
      return false;
    }
    const location = await Location.geocodeAsync(this.state.address + ' ' + this.state.city);
    console.log(location[0]);
    const address = await Location.reverseGeocodeAsync(location[0]);
    console.log(address);
    this.setState({geo: {lat: location[0].latitude, lng: location[0].longitude}});
    return true;
  }

  validateEventData() {
    if (!this.state.geo){
      this.setState({error: {message: 'כתובת לא נבדקה', field: 'address'}});
      return false;
    }
    if (!this.state.carType){
      this.setState({error: {message: 'לא הוזן סוג הרכב', field: 'carType'}});
      return false;
    }
    if (!this.state.phone){
      this.setState({error: {message: 'לא הוזן מספר טלפון', field: 'phone'}});
      return false;
    }
    if (!/^(?:0(?!([57]))(?:[23489]))(?:-?\d){7}$|^(0(?=[57])(?:-?\d){9})$/g.test(this.state.phone)) {
      this.setState({error: {message: 'מספר טלפון לא חוקי', field: 'phone'}});
      return false;
    }
    if (!this.state.name){
      this.setState({error: {message: 'לא הוזן שם', field: 'name'}});
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
          <Text style={styles.fieldName}>עיר</Text>
          <EventDetailsInputField value={event.details['city']} editable={this.props.editable} onChange={this.updateEvent.bind(this, 'city')}/>
        </View>
        <View>
          <Text style={styles.fieldName}>כתובת</Text>
          <EventDetailsInputField value={event.details['address']} editable={this.props.editable} onChange={this.updateEvent.bind(this, 'address')}/>
        </View>
        {this.props.editable?
          <View>
            <Button style={styles.button} onPress={this.validateAddress.bind(this)} title='בדוק כתובת'/>
          </View>
          : undefined
        }
        <View>
          <Text style={styles.fieldName}>בעיה</Text>
          <EventDetailsInputField value={formatEventCase(event)} editable={this.props.editable}/>
        </View>
        <View>
          <Text style={styles.fieldName}>סוג רכב</Text>
          <EventDetailsInputField value={event.details['car type']} editable={this.props.editable} onChange={this.updateEvent.bind(this, 'carType')}/>
        </View>
        <View>
          <Text style={styles.fieldName}>פרטים</Text>
          <EventDetailsInputField value={event.details['more']} editable={this.props.editable} onChange={this.updateEvent.bind(this, 'more')}/>
        </View>
        <View>
          <Text style={styles.fieldName}>טלפון</Text>
          <EventDetailsInputField value={event.details['phone number']} editable={this.props.editable} onChange={this.updateEvent.bind(this, 'phone')}/>
        </View>
        <View>
          <Text style={styles.fieldName}>שם</Text>
          <EventDetailsInputField value={event.details['caller name']} editable={this.props.editable} onChange={this.updateEvent.bind(this, 'name')}/>
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
    editable: !ownProps.navigation.state.params.event
  };
};


export default connect(mapStateToProps, mapDispatchToProps)(EventDetails);

EventDetails.propTypes = {
  createEvent: PropTypes.func,
  updateEventStatus: PropTypes.func
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
    borderColor: 'D3D3D3',
    borderWidth: 1
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
