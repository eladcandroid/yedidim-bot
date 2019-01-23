import React, { Component } from 'react'
import styled from 'styled-components/native'
import { FormattedMessage } from 'react-intl'
import { I18nManager, Linking, Image, View } from 'react-native'
import { trackEvent } from 'io/analytics'
import AlignedText from 'components/AlignedText'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'
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
import { inject, observer } from 'mobx-react/native'
import { NavigationActions } from 'react-navigation'

const MarginView = styled.View`
  margin: 10px 10px;
`
@observer
class AddCity extends Component {
  constructor(props) {
    super(props)
    this.state = {
      listViewDisplayed: 'auto',
      location: {
        id: undefined,
        name: undefined,
        lat: undefined,
        lon: undefined
      }
    }
    this.hideGooglePlacesSuggestions = this.hideGooglePlacesSuggestions.bind(
      this
    )
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
          <FormattedMessage
            id="About.AddCity.title"
            defaultMessage="הוספת ישוב"
          >
            {txt => <Title>{txt}</Title>}
          </FormattedMessage>
        </Body>
        <Right />
      </Header>
    )
  })

  hideGooglePlacesSuggestions() {
    this.setState({ listViewDisplayed: false })
  }

  GooglePlacesInput() {
    const { listViewDisplayed } = this.state
    // Fixed issues with list not closing on selection by applying
    // https://github.com/FaridSafi/react-native-google-places-autocomplete/issues/329#issuecomment-434664874
    return (
      <GooglePlacesAutocomplete
        placeholder="חיפוש בכתובת"
        placeholderTextColor="#575757"
        minLength={2} // minimum length of text to search
        autoFocus={false}
        returnKeyType="search" // Can be left out for default return key https://facebook.github.io/react-native/docs/textinput.html#returnkeytype
        listViewDisplayed={listViewDisplayed} // true/false/undefined
        fetchDetails
        renderDescription={row => row.description} // custom description render
        onFocus={() => {
          this.setState({ listViewDisplayed: 'auto' })
        }}
        onPress={(data, _details = null) => {
          // 'details' is provided when fetchDetails = true
          const { address, geo } = getAddressDetailsFromGoogleResult(_details)

          this.setState({
            location: {
              id: _details.id,
              name: address,
              lat: geo.lat,
              lon: geo.lon
          }}
          )

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
            marginLeft: 30,
            marginRight: 30,
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
        <Content style={{ flex: 1, backgroundColor: '#fff', paddingTop: 30 }}>
          <AlignedText>כתובת:</AlignedText>
          {this.GooglePlacesInput()}
        </Content>
<View style={{
  position: 'absolute',
  bottom: 50,
  width: '100%',
}}>
        <Button
          block
          large
          style={{
            borderRadius: 0,
            flex: 1,
            height: 40,
            marginLeft: '25%',
            marginRight: '25%'
          }}
          onPress={() => {
            this.props.currentUser.addLocation({
              id: this.state.location.id,
              name: this.state.location.name,
              lat: this.state.location.lat,
              lon: this.state.location.lon
            })
            this.props.navigation.goBack()
          }}
        >
          <FormattedMessage id="Locations.add.confirm">
            {txt => <Text>{txt}</Text>}
          </FormattedMessage>
        </Button>
</View>
      </Container>
    )
  }
}

export default inject(({ stores }) => ({
  currentUser: stores.authStore.currentUser
}))(AddCity)
