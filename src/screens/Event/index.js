import React, { Component } from 'react'
import styled from 'styled-components/native'
import { inject, observer } from 'mobx-react/native'
import {
  FormattedMessage,
  FormattedRelative,
  injectIntl,
  defineMessages
} from 'react-intl'
import { Linking, I18nManager, View, Alert } from 'react-native'

import {
  Button,
  Container,
  Body,
  Content,
  Header,
  Title,
  Left,
  Icon,
  Grid,
  Col,
  Row,
  Right,
  Text,
  H2,
  Thumbnail
} from 'native-base'
import { MapView } from 'expo'
import TextFieldRow from './TextFieldRow'
import AlignedText from '../../components/AlignedText'

const MarginView = styled.View`
  margin: 10px 10px;
`

const alertIgnoreMsgs = defineMessages({
  title: {
    id: 'Event.alert.ignore.title',
    defaultMessage: 'Ignore Event'
  },
  text: {
    id: 'Event.alert.ignore.text',
    defaultMessage: "I'm not interested in accepting the event"
  },
  buttonConfirm: {
    id: 'Event.alert.ignore.confirm',
    defaultMessage: 'Confirm'
  },
  buttonCancel: {
    id: 'Event.alert.ignore.cancel',
    defaultMessage: 'Cancel'
  }
})

const alertAcceptMsgs = defineMessages({
  title: {
    id: 'Event.alert.accept.title',
    defaultMessage: 'Accept Event'
  },
  text: {
    id: 'Event.alert.accept.text',
    defaultMessage: 'I want to take care of the event'
  },
  buttonConfirm: {
    id: 'Event.alert.accept.confirm',
    defaultMessage: 'Confirm'
  },
  buttonCancel: {
    id: 'Event.alert.accept.cancel',
    defaultMessage: 'Cancel'
  }
})

// TODO Move saveNotificationToken to be executed after signin, if error exists then show button on home asking user to notification access (trigger again)
// TODO Don't use once to listen to user changes, that way we can have a computed property to enable notifications (Notification Store - will be used for muted)
// TODO Remove token after user logout
// TODO On notification, save the event data to event store and sync with firebase?

@observer
class EventScreen extends Component {
  static navigationOptions = ({ navigation }) => ({
    header: (
      <Header>
        <Left>
          <Button transparent onPress={() => navigation.goBack()}>
            <Icon name={I18nManager.isRTL ? 'arrow-forward' : 'arrow-back'} />
          </Button>
        </Left>
        <Body>
          <FormattedMessage id="Event.title" defaultMessage="Event">
            {txt => <Title>{txt}</Title>}
          </FormattedMessage>
        </Body>
        <Right />
      </Header>
    )
  })

  handleIgnoreEvent = () => {
    const { intl, removeEvent, navigation } = this.props
    const { state: { params: { eventId } } } = navigation

    Alert.alert(
      intl.formatMessage(alertIgnoreMsgs.title),
      intl.formatMessage(alertIgnoreMsgs.text),
      [
        {
          text: intl.formatMessage(alertIgnoreMsgs.buttonConfirm),
          onPress: () => {
            // Ignore Event
            removeEvent(eventId)
            // Navigate back
            navigation.goBack()
          }
        },
        {
          text: intl.formatMessage(alertIgnoreMsgs.buttonCancel),
          style: 'cancel'
        }
      ],
      { cancelable: false }
    )
  }

  handleAcceptEvent = () => {
    const { intl, navigation, findById } = this.props
    const { state: { params: { eventId } } } = navigation
    const event = findById(eventId)

    Alert.alert(
      intl.formatMessage(alertAcceptMsgs.title),
      intl.formatMessage(alertAcceptMsgs.text),
      [
        {
          text: intl.formatMessage(alertAcceptMsgs.buttonConfirm),
          onPress: () => {
            // Accept Event
            event.accept()
          }
        },
        {
          text: intl.formatMessage(alertAcceptMsgs.buttonCancel),
          style: 'cancel'
        }
      ],
      { cancelable: false }
    )
  }

  render() {
    const { navigation, findById } = this.props
    const { state: { params: { eventId } } } = navigation
    const event = findById(eventId) || {}
    const {
      guid,
      eventType,
      eventTypeImage,
      timestamp,
      lat,
      lon,
      caller,
      more,
      fullAddress,
      phone,
      carType,
      isAwaitingAssignment
    } = event

    if (!guid) {
      return null
    }

    // If event is awaiting assignment, viewMode should be true
    const viewMode = isAwaitingAssignment

    return (
      <Container>
        <Content style={{ flex: 1, backgroundColor: '#fff' }}>
          <Grid>
            <Row>
              <Col size={1}>
                <MarginView>
                  <Thumbnail
                    source={{
                      uri: eventTypeImage
                    }}
                  />
                </MarginView>
              </Col>
              <Col size={3}>
                <MarginView>
                  <H2 style={{ textAlign: 'left' }}>{eventType}</H2>
                  <FormattedRelative value={timestamp}>
                    {relative => <AlignedText note>{relative}</AlignedText>}
                  </FormattedRelative>
                </MarginView>
              </Col>
            </Row>
            <Row>
              <Col>
                <MapView
                  style={{ height: 200, flex: 1 }}
                  region={{
                    latitude: lat,
                    longitude: lon,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421
                  }}
                  showsMyLocationButton
                >
                  <MapView.Marker
                    coordinate={{ latitude: lat, longitude: lon }}
                    title={caller}
                    description={more}
                  />
                </MapView>
              </Col>
            </Row>
            <FormattedMessage
              id="Event.description"
              defaultMessage="Description"
            >
              {label => <TextFieldRow label={label} value={more} />}
            </FormattedMessage>
            <FormattedMessage id="Event.location" defaultMessage="Location">
              {label => <TextFieldRow label={label} value={fullAddress} />}
            </FormattedMessage>
            {!viewMode && (
              <FormattedMessage id="Event.caller" defaultMessage="Name">
                {label => <TextFieldRow label={label} value={caller} />}
              </FormattedMessage>
            )}
            {!viewMode && (
              <FormattedMessage id="Event.phone" defaultMessage="Phone">
                {label => <TextFieldRow label={label} value={phone} />}
              </FormattedMessage>
            )}
            {!viewMode && (
              <FormattedMessage id="Event.carType" defaultMessage="Car type">
                {label => <TextFieldRow label={label} value={carType} />}
              </FormattedMessage>
            )}
            <Row>
              <Col>
                <MarginView>
                  <Button
                    block
                    info
                    onPress={() =>
                      Linking.openURL(`https://waze.com/ul?ll=${lat},${lon}`)}
                  >
                    <FormattedMessage
                      id="Event.button.navigate"
                      defaultMessage="Navigate with Waze"
                    >
                      {txt => <Text>{txt}</Text>}
                    </FormattedMessage>
                    <Icon name="md-map" />
                  </Button>
                </MarginView>
              </Col>
            </Row>
            {!viewMode && (
              <Row>
                <Col>
                  <MarginView>
                    <Button
                      block
                      success
                      onPress={() => Linking.openURL(`tel:${phone}`)}
                    >
                      <FormattedMessage
                        id="Event.button.callPerson"
                        defaultMessage="Call Person"
                      >
                        {txt => <Text>{txt}</Text>}
                      </FormattedMessage>
                      <Icon name="md-call" />
                    </Button>
                  </MarginView>
                </Col>
              </Row>
            )}
          </Grid>
        </Content>
        <View style={{ height: 70, backgroundColor: '#fff' }}>
          <Grid>
            <Row style={{ marginTop: 10 }}>
              <Col>
                <Button
                  full
                  large
                  block
                  success
                  onPress={this.handleAcceptEvent}
                >
                  <FormattedMessage
                    id="Event.button.accept"
                    defaultMessage="Accept"
                  >
                    {txt => <Text>{txt}</Text>}
                  </FormattedMessage>
                  <Icon name="md-checkmark-circle" />
                </Button>
              </Col>
              <Col>
                <Button
                  full
                  large
                  block
                  danger
                  onPress={this.handleIgnoreEvent}
                >
                  <FormattedMessage
                    id="Event.button.ignore"
                    defaultMessage="Ignore"
                  >
                    {txt => <Text>{txt}</Text>}
                  </FormattedMessage>
                  <Icon name="md-close-circle" />
                </Button>
              </Col>
            </Row>
          </Grid>
        </View>
      </Container>
    )
  }
}

export default inject(({ stores }) => ({
  currentUser: stores.authStore.currentUser,
  findById: stores.eventStore.findById,
  removeEvent: stores.eventStore.removeEvent
}))(injectIntl(EventScreen))
