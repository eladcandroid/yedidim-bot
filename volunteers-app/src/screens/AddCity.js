import React, { Component } from 'react'
import styled from 'styled-components/native'
import { FormattedMessage } from 'react-intl'
import { I18nManager, Linking, Image, View } from 'react-native'
import { trackEvent } from 'io/analytics'
import StartachLogo from 'images/startach-logo.jpg'
import AlignedText from 'components/AlignedText'
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete'
import {
  geocodeAddress,
  getAddressDetailsFromGoogleResult
} from '../actions/geocodingActions'

import {
  Button,
  Body,
  Header,
  Title,
  Left,
  Icon,
  Label,
  Right,
  Container,
  Content,
  Text,
  Grid,
  Col,
  Row
} from 'native-base'

const MarginView = styled.View`
  margin: 10px 10px;
`
class AddCity extends Component {
  constructor(props) {
    super(props)
    this.state = {
      details: {
        address: undefined,
        geo: undefined,
        category: 'Other'
      },
      listViewDisplayed: 'auto',
    }
    this.hideGooglePlacesSuggestions = this.hideGooglePlacesSuggestions.bind(this)
  }
  static navigationOptions = ({ navigation }) => ({
    header: (
      <Header>
        <Left>
          <Button
            transparent
            onPress={() => {
              trackEvent('Navigation', { page: 'BackFromAddCity' })
              navigation.goBack()
            }}
          >
            <Icon name={I18nManager.isRTL ? 'arrow-forward' : 'arrow-back'} />
          </Button>
        </Left>
        <Body>
        <FormattedMessage id="About.AddCity.title" defaultMessage="הוספת ישוב">
          {txt => <Title>{txt}</Title>}
        </FormattedMessage>
        </Body>
        <Right />
      </Header>
    )
  })


  hideGooglePlacesSuggestions() {
    this.setState({listViewDisplayed: false})
  }

  GooglePlacesInput() {
    const {details, listViewDisplayed} = this.state
    // Fixed issues with list not closing on selection by applying
    // https://github.com/FaridSafi/react-native-google-places-autocomplete/issues/329#issuecomment-434664874
    return (
      <GooglePlacesAutocomplete
        placeholder="חיפוש בכתובת"
        placeholderTextColor="#575757"
        minLength={2} // minimum length of text to search
        autoFocus={false}
        returnKeyType={'search'} // Can be left out for default return key https://facebook.github.io/react-native/docs/textinput.html#returnkeytype
        listViewDisplayed={listViewDisplayed} // true/false/undefined
        fetchDetails
        renderDescription={row => row.description} // custom description render
        onFocus={() => {
          this.setState({listViewDisplayed: 'auto'})
        }}
        onPress={(data, _details = null) => {
          // 'details' is provided when fetchDetails = true
          const {address, geo} = getAddressDetailsFromGoogleResult(_details)
          console.log("Details=",_details)
          console.log("address=",address)
          console.log("geo=",geo)
          this.hideGooglePlacesSuggestions()
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
            borderWidth: 1,
            borderTopWidth: 2,
            borderRadius: 0,
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
    return (
      <Container>
        <Content style={{ flex: 1, backgroundColor: '#fff' }}>
          <View style={{margin:30}}>
          <AlignedText>כתובת:</AlignedText>
          {this.GooglePlacesInput()}
          </View>
        </Content>
      </Container>
    )
  }
}

export default AddCity
