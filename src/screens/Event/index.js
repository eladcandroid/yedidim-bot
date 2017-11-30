import React, { Component } from 'react'
import { inject, observer } from 'mobx-react/native'
import { FormattedMessage, defineMessages } from 'react-intl'
import { I18nManager } from 'react-native'

import {
  Button,
  Body,
  Header,
  Title,
  Left,
  Icon,
  Right,
  Text
} from 'native-base'
import EventDetails from '../../components/EventDetails'
import ButtonsConfirmationBar from '../../components/ButtonsConfirmationBar'

const ignore = {
  modalMsgs: defineMessages({
    title: {
      id: 'Event.alert.ignore.title',
      defaultMessage: 'Ignore Event'
    },
    text: {
      id: 'Event.alert.ignore.text',
      defaultMessage: "I'm not interested in accepting the event"
    },
    confirm: {
      id: 'Event.alert.ignore.confirm',
      defaultMessage: 'Confirm'
    },
    cancel: {
      id: 'Event.alert.ignore.cancel',
      defaultMessage: 'Cancel'
    }
  }),
  buttonMsgs: {
    id: 'Event.button.ignore',
    defaultMessage: 'Ignore'
  }
}

const accept = {
  modalMsgs: defineMessages({
    title: {
      id: 'Event.alert.accept.title',
      defaultMessage: 'Accept Event'
    },
    text: {
      id: 'Event.alert.accept.text',
      defaultMessage: 'I want to take care of the event'
    },
    confirm: {
      id: 'Event.alert.accept.confirm',
      defaultMessage: 'Confirm'
    },
    cancel: {
      id: 'Event.alert.accept.cancel',
      defaultMessage: 'Cancel'
    }
  }),
  buttonMsgs: {
    id: 'Event.button.accept',
    defaultMessage: 'Accept'
  }
}

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
          {!navigation.state.params.isAssigned && (
            <Button transparent onPress={() => navigation.goBack()}>
              <Icon name={I18nManager.isRTL ? 'arrow-forward' : 'arrow-back'} />
            </Button>
          )}
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

  componentWillMount() {
    const { navigation, event } = this.props
    const { setParams, state: { params: { isAssigned } } } = navigation
    if (event.isAssigned !== isAssigned) {
      setParams({ isAssigned: event.isAssigned })
    }
  }

  componentWillReceiveProps(nextProps) {
    const { navigation } = this.props
    const { event } = nextProps
    const { setParams, state: { params: { isAssigned } } } = navigation
    if (event.isAssigned !== isAssigned) {
      setParams({ isAssigned: event.isAssigned })
    }
  }

  render() {
    const { event, navigation, removeEvent } = this.props

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
        <ButtonsConfirmationBar
          ok={{
            ...accept,
            onPress: () => {
              // Accept Event
              event.accept()
            }
          }}
          cancel={{
            ...ignore,
            onPress: () => {
              // Ignore Event
              removeEvent(event.guid)
              // Navigate back
              navigation.goBack()
            }
          }}
        />
      </EventDetails>
    )
  }
}

export default inject(
  ({ stores }, { navigation: { state: { params: { eventId } } } }) => {
    const event = stores.eventStore.findById(eventId)
    return {
      // Return isAssigned because we need mobx to refresh the view
      //  if it changes
      isAssigned: event.isAssigned,
      event,
      removeEvent: stores.eventStore.removeEvent
    }
  }
)(EventScreen)
