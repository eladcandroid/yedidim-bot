import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Platform, KeyboardAvoidingView, ScrollView, View, Text, Alert, StyleSheet, I18nManager } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Picker, Form, Item, Label, Input, Button } from 'native-base';
import { getTextStyle } from "../common/utils";
import { EventCases, EventStatus, EventSource } from "../constants/consts";
import { createEvent } from "../actions/dataSourceActions";
import { geocodeAddress } from "../actions/geocodingActions";

class KeyboardAwareScrollViewComponent extends React.Component {

  render() {
    if (Platform.OS === 'ios') {
      return (
        <KeyboardAwareScrollView {...this.props} style={styles.scrollContainer}>
          {this.props.children}
        </KeyboardAwareScrollView>
      )
    }

    return (
      <KeyboardAvoidingView {...this.props} style={styles.scrollContainer} behavior="padding" keyboardVerticalOffset={100}>
        <ScrollView>
          {this.props.children}
        </ScrollView>
      </KeyboardAvoidingView>
    )
  }
}

class EventDetailsEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {address: undefined, geo: undefined, case: 8, street_number: 0, needToValidateAddress: false};
    this.updateEvent = this.updateEvent.bind(this);
    this.validateAddress = this.validateAddress.bind(this);
  }

  updateEvent(field, value) {
    if (field === 'address'){
      this.setState({geo: undefined, needToValidateAddress: true});
    }
    this.setState({[field]: value});
  }

  createNewEvent() {
    if (!this.validateEventData()){
      return;
    }
    let details = Object.assign({}, this.state);
    details.needToValidateAddress = undefined;
    const event = {
      status: EventStatus.Submitted,
      source: EventSource.App,
      dispatcher: this.props.user.id,
      details
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
    this.setState({needToValidateAddress: false});
    const location = await geocodeAddress(this.state.address);
    console.log(location);
    if (!location){
      this.setState({error: {message: 'כתובת לא חוקית', field: 'address', needToValidateAddress: true}});
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
    if (!this.state['case']){
      this.setState({error: {message: 'לא נבחר סוג בעיה', field: 'case'}});
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

  renderEventCasePicker() {
    return (
      <Picker
        iosHeader="בחר סוג בעיה"
        headerBackButtonText="חזור"
        mode="dropdown"
        placeholder="בחר סוג בעיה"
        itemTextStyle={getTextStyle(styles.pickerItem)}
        textStyle={getTextStyle(styles.pickerItem)}
        selectedValue={this.state.case}
        onValueChange={(value) => this.setState({case: value})}
      >
        {EventCases.map((eventCase) => {
          return (<Picker.Item label={eventCase.label} value={eventCase.case} key={eventCase.case}/>);
        })}
      </Picker>
    )
  }

  renderInput(label, field) {
    return (
      <Item floatingLabel style={styles.item}>
        <Label style={I18nManager.isRTL ? undefined: {textAlign: 'right'}}>{label}</Label>
        <Input
          value={this.state[field]}
          onChangeText={(value) => {this.updateEvent(field, value)}}/>
      </Item>
    );
  }

  render() {
    return (
      <KeyboardAwareScrollViewComponent>
        <View style={styles.container}>
          {this.showValidationError()}
          <Form>
            {this.renderInput('כתובת', 'address')}
            <Button primary style={styles.button} onPress={this.validateAddress} disabled={!this.state.needToValidateAddress}>
              <Text style={styles.buttonText}>בדוק כתובת</Text>
            </Button>
            <Label style={getTextStyle(styles.pickerLabel)}>סוג אירוע</Label>
            {this.renderEventCasePicker()}
            {this.renderInput('סוג רכב', 'car type')}
            {this.renderInput('פרטים', 'more')}
            {this.renderInput('טלפון', 'phone number')}
            {this.renderInput('שם', 'caller name')}
          </Form>
          <Button full style={styles.createButton} onPress={this.createNewEvent.bind(this)}>
            <Text style={styles.buttonText}>פתח אירוע</Text>
          </Button>
        </View>
      </KeyboardAwareScrollViewComponent>
    );
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    createEvent: (event) => {
      dispatch(createEvent(event));
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
    editable: !ownProps.navigation.state.params.key,
    user: state.dataSource.user
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(EventDetailsEditor);

EventDetailsEditor.propTypes = {
  createEvent: PropTypes.func,
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
    paddingRight: 8,
    paddingBottom: 10,
    paddingLeft: 8,
    backgroundColor: 'white'
  },
  item: {
    flex: 1,
    flexDirection: 'row-reverse'
  },
  fieldName: {
    flex: 1
  },
  pickerLabel: {
    paddingRight: 20
  },
  pickerItem: {
    flex: 1,
  },
  button: {
    marginTop: 10,
    width: 120,
    justifyContent: 'center'
  },
  createButton: {
    marginTop: 10
  },
  buttonText: {
    color: 'white',
    alignSelf:'center'
  }
});