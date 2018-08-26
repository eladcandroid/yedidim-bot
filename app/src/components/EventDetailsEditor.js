import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Platform, KeyboardAvoidingView, View, Text, Alert, StyleSheet, I18nManager } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Picker, Form, Item, Label, Input, Button } from 'native-base';
import { getTextStyle } from "../common/utils";
import { EventCases, EventStatus, EventSource, ScreenType } from "../constants/consts";
import { createEvent, updateEvent } from "../actions/dataSourceActions";
import {geocodeAddress, getAddressDetailsFromGoogleResult} from "../actions/geocodingActions";
import { sendNotification } from "../actions/notificationsActions";
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

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
          {this.props.children}
      </KeyboardAvoidingView>
    )
  }
}

class EventDetailsEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {address: undefined, geo: undefined, category: 'Other', needToValidateAddress: false};
    this.updateEventData = this.updateEventData.bind(this);
    this.validateAddress = this.validateAddress.bind(this);
    this.createNewEvent = this.createNewEvent.bind(this);
    this.updateExistingEvent = this.updateExistingEvent.bind(this);
  }

  componentWillMount() {
      if (this.props.event) {
        this.setState(this.props.event.details);
      }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.event && nextProps.event.details !== this.props.event.details) {
      if (this.state.modified){
        this.setState({error: {message: 'אירוע שונה ע״י מוקדן אחר'}, modified: false});
      }
      this.setState(nextProps.event.details);
    }
  }

  updateEventData(field, value) {
    if (field === 'address'){
      this.setState({geo: undefined, needToValidateAddress: true});
    }
    this.setState({[field]: value, modified: true});
  }

  getDetailsFromState() {
    let details = Object.assign({}, this.state);
    delete details['needToValidateAddress'];
    delete details['error'];
    delete details['modified'];
    return details;
  }
  createNewEvent() {
    if (!this.validateEventData()){
      return;
    }
    const event = {
      status: EventStatus.Sent,
      source: EventSource.App,
      dispatcher: this.props.user.id,
      details: this.getDetailsFromState()
    };
    this.props.createEvent(event);
    this.props.navigate(ScreenType.EventsList);
  }

  updateExistingEvent() {
    if (!this.validateEventData()){
      return;
    }
    this.props.event.details = this.getDetailsFromState();
    this.props.updateEvent(this.props.event);
    this.props.sendNotification(this.props.event.key, this.props.event.assignedTo);
    this.props.navigate(ScreenType.EventsList);
  }

  async validateAddress() {
    if (!this.state.address){
      this.setState({error: {message: 'לא הוזנה כתובת', field: 'address'}});
      return false;
    }
    this.setState({needToValidateAddress: false});
    const location = await geocodeAddress(this.state.address);
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
    if (typeof this.state['category'] === "undefined"){
      this.setState({error: {message: 'לא נבחר סוג בעיה', field: 'category'}});
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

  setCategory(categoryId) {
    const category = this.props.categories.find(category => category.id === categoryId);
    const subCategory = category && category.subCategories ? category.subCategories[0].id : undefined;
    this.setState({category: categoryId, subCategory, modified: true});
  }

  renderCategoryPicker() {
    return (
      <Picker
        iosHeader="בחר סוג בעיה"
        headerBackButtonText="חזור"
        mode="dropdown"
        placeholder="בחר סוג בעיה"
        itemTextStyle={getTextStyle(styles.pickerItem)}
        textStyle={getTextStyle(styles.pickerItem)}
        selectedValue={this.state.category}
        onValueChange={(value) => this.setCategory(value)}
      >
        {this.props.categories.map((category) => {
          return (<Picker.Item label={category.displayName} value={category.id} key={category.id}/>);
        })}
      </Picker>
    )
  }
  renderSubCategoryPicker() {
    const category = this.props.categories.find(category => category.id === this.state.category);
    if (!category || !category.subCategories){
      return;
    }
    return (
      <Picker
        iosHeader="בחר תת קטגוריה"
        headerBackButtonText="חזור"
        mode="dropdown"
        placeholder="תת קטגוריה"
        itemTextStyle={getTextStyle(styles.pickerItem)}
        textStyle={getTextStyle(styles.pickerItem)}
        selectedValue={this.state.subCategory}
        onValueChange={(value) => this.setState({subCategory: value, modified: true})}
      >
        {category.subCategories.map((subCategory) => {
          return (<Picker.Item label={subCategory.displayName} value={subCategory.id} key={subCategory.id}/>);
        })}
      </Picker>
    )
  }

  renderInput(label, field, type = 'default') {
    return (
      <Item floatingLabel style={styles.item}>
        <Label style={I18nManager.isRTL ? undefined: {textAlign: 'right'}}>{label}</Label>
        <Input
          value={this.state[field]}
          keyboardType={type}
          onChangeText={(value) => {this.updateEventData(field, type === 'numeric' ? value.trim() : value)}}/>
      </Item>
    );
  }

  GooglePlacesInput(){
    return (
      <GooglePlacesAutocomplete
        placeholder='Search'
        minLength={2} // minimum length of text to search
        autoFocus={false}
        returnKeyType={'search'} // Can be left out for default return key https://facebook.github.io/react-native/docs/textinput.html#returnkeytype
        listViewDisplayed='auto'    // true/false/undefined
        fetchDetails={true}
        renderDescription={row => row.description} // custom description render
        onPress={(data, details = null) => { // 'details' is provided when fetchDetails = true
          let geoStateData = getAddressDetailsFromGoogleResult(details);
          this.setState(geoStateData)
        }}

        getDefaultValue={() => ''}

        query={{
          // available options: https://developers.google.com/places/web-service/autocomplete
          key: 'AIzaSyCcOFOs1z1nMIWrDvOuEimpwaezFX4h2TY',
          language: 'he', // language of the results
        }}

        styles={{
          textInputContainer: {
            width: '100%'
          },
          description: {
            fontWeight: 'bold'
          },
          predefinedPlacesDescription: {
            color: '#1faadb'
          }
        }}

        nearbyPlacesAPI='GooglePlacesSearch' // Which API to use: GoogleReverseGeocoding or GooglePlacesSearch
        debounce={200} // debounce the requests in ms. Set to 0 to remove debounce. By default 0ms.
      />
    );
  }

  render() {
    const { category } = this.state

    return (
      <KeyboardAwareScrollViewComponent>
        <View style={styles.container}>
          {this.showValidationError()}
          <Form>
            {this.GooglePlacesInput()}
            <Label style={getTextStyle(styles.pickerLabel)}>סוג אירוע</Label>
            {this.renderCategoryPicker()}
            {this.renderSubCategoryPicker()}
            {category !== 'SlammedDoor' && this.renderInput('סוג רכב', 'car type')}
            {this.renderInput('פרטים', 'more')}
            {this.renderInput('מידע פרטי', 'private_info')}
            {this.renderInput('טלפון', 'phone number', 'numeric')}
            {this.renderInput('שם', 'caller name')}
          </Form>
          <Button full style={styles.createButton}
                  disabled={this.props.event.key && !this.state.modified}
                  onPress={this.props.event.key ? this.updateExistingEvent : this.createNewEvent}>
            <Text style={styles.buttonText}>{this.props.event.key ? 'עדכן' : 'פתח'} אירוע </Text>
          </Button>
        </View>
      </KeyboardAwareScrollViewComponent>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    createEvent: (event) => {
      dispatch(createEvent(event));
    },
    updateEvent: (event) => {
      dispatch(updateEvent(event));
    },
    sendNotification: (eventKey, volunteer) => {
      dispatch(sendNotification(eventKey, undefined, volunteer));
    }
  };
};

const mapStateToProps = (state, ownProps) => {
  let event = state.dataSource.events && ownProps.params ? state.dataSource.events.find(event => event.key === ownProps.params.key) : undefined;
  if (!event) {
    event = {status: EventStatus.Draft, details: {}};
  }
  const categories = state.dataSource.categories || [];
  return {
    event,
    user: state.dataSource.user,
    categories
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(EventDetailsEditor);

EventDetailsEditor.propTypes = {
  createEvent: PropTypes.func,
  updateEvent: PropTypes.func,
  sendNotification: PropTypes.func,
  user: PropTypes.object,
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

