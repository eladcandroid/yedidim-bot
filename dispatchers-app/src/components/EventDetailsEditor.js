import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import {
  Platform,
  KeyboardAvoidingView,
  View,
  Text,
  Alert,
  StyleSheet,
  I18nManager
} from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { Picker, Form, Item, Label, Input, Button } from 'native-base'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'
import { getTextStyle } from '../common/utils'
import { EventStatus, EventSource, ScreenType } from '../constants/consts'
import { createEvent, updateEvent } from '../actions/dataSourceActions'
import {
  geocodeAddress,
  getAddressDetailsFromGoogleResult
} from '../actions/geocodingActions'
import { sendNotification } from '../actions/notificationsActions'

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
      <KeyboardAvoidingView
        {...this.props}
        style={styles.scrollContainer}
        behavior="padding"
        keyboardVerticalOffset={100}
      >
        {this.props.children}
      </KeyboardAvoidingView>
    )
  }
}

class EventDetailsEditor extends Component {
  constructor(props) {
    super(props)
    this.state = {
      address: undefined,
      geo: undefined,
      category: 'Other',
      listViewDisplayed: 'auto'
    }
    this.updateEventData = this.updateEventData.bind(this)
    this.validatePlusCode = this.validatePlusCode.bind(this)
    this.createNewEvent = this.createNewEvent.bind(this)
    this.updateExistingEvent = this.updateExistingEvent.bind(this)
  }

  componentWillMount() {
    if (this.props.event) {
      this.setState(this.props.event.details)
    }
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.event &&
      nextProps.event.details !== this.props.event.details
    ) {
      if (this.state.modified) {
        this.setState({
          error: { message: 'אירוע שונה ע״י מוקדן אחר' },
          modified: false
        })
      }
      this.setState(nextProps.event.details)
    }
  }

  updateEventData(field, value) {
    if (field === 'address') {
      this.setState({ geo: undefined})
    }
    this.setState({ [field]: value, modified: true })
  }

  getDetailsFromState() {
    let details = Object.assign({}, this.state)
    delete details['error']
    delete details['modified']
    return details
  }
  async createNewEvent() {
    if (!await this.validateEventData()) {
      return
    }
    this.setState({modified: false})
    const event = {
      status: EventStatus.Sent,
      source: EventSource.App,
      dispatcher: this.props.user.id,
      details: this.getDetailsFromState()
    }
    this.props.createEvent(event)
    this.props.navigate(ScreenType.EventsList)
  }

  updateExistingEvent() {
    if (!this.validateEventData()) {
      return
    }
    this.props.event.details = this.getDetailsFromState()
    this.props.updateEvent(this.props.event)
    this.props.sendNotification(
      this.props.event.key,
      this.props.event.assignedTo
    )
    this.props.navigate(ScreenType.EventsList)
  }

  async validatePlusCode() {
    const plusCode = this.state.plus_code;
    if (plusCode.length < 11 || !plusCode.includes(' ') || !plusCode.includes('+')) {
      this.setState({error: {message: 'צריך להזין plus code וכתובת', field: 'plus_code'}})
      return false
    }
    let location = await geocodeAddress(plusCode, true)
    if (!location) {
      this.setState({error: {message: 'Plus Code לא חוקי', field: 'plus_code'}})
      return false
    }
    location.address = this.state.plus_code.slice(8)
    this.setState(location)
    return true
  }

  async validateEventData() {
    if (!this.state.address && !this.state.plus_code) {
      this.setState({ error: { message: 'לא הוזנה כתובת', field: 'address' } })
      return false
    }

    if (!this.state.geo && this.state.plus_code){
      if (!await this.validatePlusCode()) {
        return false;
      }
    }
    if (!this.state.geo) {
      this.setState({ error: { message: 'כתובת לא נבדקה', field: 'address' } })
      return false
    }
    if (typeof this.state['category'] === 'undefined') {
      this.setState({
        error: { message: 'לא נבחר סוג בעיה', field: 'category' }
      })
      return false
    }
    if (!this.state['car type']) {
      this.setState({
        error: { message: 'לא הוזן סוג הרכב', field: 'car type' }
      })
      return false
    }
    if (!this.state['phone number']) {
      this.setState({
        error: { message: 'לא הוזן מספר טלפון', field: 'phone number' }
      })
      return false
    }
    if (
      !/^(?:0(?!([57]))(?:[23489]))(?:-?\d){7}$|^(0(?=[57])(?:-?\d){9})$/g.test(
        this.state['phone number']
      )
    ) {
      this.setState({
        error: { message: 'מספר טלפון לא חוקי', field: 'phone number' }
      })
      return false
    }
    if (!this.state['caller name']) {
      this.setState({ error: { message: 'לא הוזן שם', field: 'caller name' } })
      return false
    }
    return true
  }

  showValidationError() {
    if (!this.state.error) {
      return
    }
    Alert.alert('שגיאה', this.state.error.message, [
      {
        text: 'אישור',
        onPress: () => {
          this.setState({ error: undefined })
        }
      }
    ])
  }

  setCategory(categoryId) {
    const category = this.props.categories.find(
      category => category.id === categoryId
    )
    const subCategory =
      category && category.subCategories ? category.subCategories[0].id : null
    this.setState({ category: categoryId, subCategory, modified: true })
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
        onValueChange={value => this.setCategory(value)}
      >
        {this.props.categories.map(category => {
          return (
            <Picker.Item
              label={category.displayName}
              value={category.id}
              key={category.id}
            />
          )
        })}
      </Picker>
    )
  }
  renderSubCategoryPicker() {
    const category = this.props.categories.find(
      category => category.id === this.state.category
    )
    if (!category || !category.subCategories) {
      return
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
        onValueChange={value =>
          this.setState({ subCategory: value, modified: true })
        }
      >
        {category.subCategories.map(subCategory => {
          return (
            <Picker.Item
              label={subCategory.displayName}
              value={subCategory.id}
              key={subCategory.id}
            />
          )
        })}
      </Picker>
    )
  }

  renderInput(label, field, type = 'default') {
    return (
      <Item floatingLabel style={styles.item}>
        <Label style={I18nManager.isRTL ? undefined : { textAlign: 'right' }}>
          {label}
        </Label>
        <Input
          value={this.state[field]}
          keyboardType={type}
          onChangeText={value => {
            this.updateEventData(
              field,
              type === 'numeric' ? value.trim() : value
            )
          }}
        />
      </Item>
    )
  }

  GooglePlacesInput() {
    // Fixed issues with list not closing on selection by applying
    // https://github.com/FaridSafi/react-native-google-places-autocomplete/issues/329#issuecomment-434664874
    return (
      <GooglePlacesAutocomplete
        placeholder="חיפוש בכתובת"
        placeholderTextColor="#575757"
        minLength={2} // minimum length of text to search
        autoFocus={false}
        returnKeyType={'search'} // Can be left out for default return key https://facebook.github.io/react-native/docs/textinput.html#returnkeytype
        listViewDisplayed={this.state.listViewDisplayed} // true/false/undefined
        fetchDetails
        renderDescription={row => row.description} // custom description render
        onFocus={() => {
          this.setState({ listViewDisplayed: 'auto' })
        }}
        onPress={(data, details = null) => {
          // 'details' is provided when fetchDetails = true
          let geoStateData = getAddressDetailsFromGoogleResult(details)
          this.setState({ ...geoStateData, listViewDisplayed: false })
        }}
        getDefaultValue={() => ''}
        query={{
          // available options: https://developers.google.com/places/web-service/autocomplete
          key: 'AIzaSyCcOFOs1z1nMIWrDvOuEimpwaezFX4h2TY',
          language: 'he' // language of the results
        }}
        styles={{
          container: {
            marginTop: 0,
            marginBottom: 20
          },
          textInputContainer: {
            backgroundColor: 'rgba(0,0,0,0)',
            borderTopWidth: 0
          },
          textInput: {
            marginLeft: 0,
            marginRight: 0,
            height: 38,
            color: '#575757',
            fontSize: 17,
            borderBottomColor: '#D9D5DC',
            borderBottomWidth: 1,
            textAlign: 'right'
          },
          predefinedPlacesDescription: {
            color: '#1faadb'
          },
          description: {
            fontWeight: 'bold'
          }
        }}
        nearbyPlacesAPI="GooglePlacesSearch" // Which API to use: GoogleReverseGeocoding or GooglePlacesSearch
        debounce={200} // debounce the requests in ms. Set to 0 to remove debounce. By default 0ms.
      />
    )
  }

  render() {
    const { category } = this.state

    return (
      <KeyboardAwareScrollViewComponent>
        <View style={styles.container}>
          {this.showValidationError()}
          <Form>
            <Label style={getTextStyle(styles.addressLabel)}>כתובת</Label>
            {this.GooglePlacesInput()}
            <Label style={getTextStyle(styles.pickerLabel)}>סוג אירוע</Label>
            {this.renderCategoryPicker()}
            {this.renderSubCategoryPicker()}
            {category !== 'SlammedDoor' &&
              this.renderInput('סוג רכב', 'car type')}
            {this.renderInput('Plus Code מיקום דרך', 'plus_code')}
            {this.renderInput('פרטים', 'more')}
            {this.renderInput('מידע פרטי', 'private_info')}
            {this.renderInput('טלפון', 'phone number', 'numeric')}
            {this.renderInput('שם', 'caller name')}
          </Form>
          <Button
            full
            style={styles.createButton}
            disabled={this.props.event.key && !this.state.modified}
            onPress={
              this.props.event.key
                ? this.updateExistingEvent
                : this.createNewEvent
            }
          >
            <Text style={styles.buttonText}>
              {this.props.event.key ? 'עדכן' : 'פתח'} אירוע{' '}
            </Text>
          </Button>
        </View>
      </KeyboardAwareScrollViewComponent>
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    createEvent: event => {
      dispatch(createEvent(event))
    },
    updateEvent: event => {
      dispatch(updateEvent(event))
    },
    sendNotification: (eventKey, volunteer) => {
      dispatch(sendNotification(eventKey, undefined, volunteer))
    }
  }
}

const mapStateToProps = (state, ownProps) => {
  let event =
    state.dataSource.events && ownProps.params
      ? state.dataSource.events.find(event => event.key === ownProps.params.key)
      : undefined
  if (!event) {
    event = { status: EventStatus.Draft, details: {} }
  }
  const categories = state.dataSource.categories || []
  return {
    event,
    user: state.dataSource.user,
    categories
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EventDetailsEditor)

EventDetailsEditor.propTypes = {
  createEvent: PropTypes.func,
  updateEvent: PropTypes.func,
  sendNotification: PropTypes.func,
  user: PropTypes.object,
  categories: PropTypes.array
}

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
  addressLabel: {
    paddingRight: 20,
    marginTop: 10
  },
  pickerItem: {
    flex: 1
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
    alignSelf: 'center'
  }
})
