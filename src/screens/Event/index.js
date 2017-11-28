import React, { Component } from 'react'
import { inject, observer } from 'mobx-react/native'
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl'
import { I18nManager, Alert } from 'react-native'

import {
  Button,
  Body,
  Header,
  Title,
  Left,
  Icon,
  Grid,
  Col,
  Row,
  Right,
  Text
} from 'native-base'
import EventDetails from '../../components/EventDetails'

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
    const { intl, removeEvent, event, navigation } = this.props

    Alert.alert(
      intl.formatMessage(alertIgnoreMsgs.title),
      intl.formatMessage(alertIgnoreMsgs.text),
      [
        {
          text: intl.formatMessage(alertIgnoreMsgs.buttonConfirm),
          onPress: () => {
            // Ignore Event
            removeEvent(event.guid)
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
    const { event, intl } = this.props

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
    const { event } = this.props

    if (!event || !event.guid) {
      return (
        <FormattedMessage
          id="Event.error.notfound"
          defaultMessage="Sorry, unable to find event details. Please contact administrator."
        >
          {txt => <Text>{txt}</Text>}
        </FormattedMessage>
      )
    }

    return (
      <EventDetails event={event}>
        <Grid>
          <Row style={{ marginTop: 10 }}>
            <Col>
              <Button full large block success onPress={this.handleAcceptEvent}>
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
              <Button full large block danger onPress={this.handleIgnoreEvent}>
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
      </EventDetails>
    )
  }
}

export default inject(
  ({ stores }, { navigation: { state: { params: { eventId } } } }) => ({
    event: stores.eventStore.findById(eventId),
    removeEvent: stores.eventStore.removeEvent
  })
)(injectIntl(EventScreen))
