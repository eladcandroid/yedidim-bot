import React, { Component } from 'react'
import { inject, observer } from 'mobx-react/native'
import { FormattedMessage, defineMessages } from 'react-intl'
import { I18nManager, Alert } from 'react-native'

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
import EventDetails from '../components/EventDetails'
import ButtonsConfirmationBar from '../components/ButtonsConfirmationBar'
import TakenEventButtons from '../components/TakenEventButtons'

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

const cancel = {
  modalMsgs: defineMessages({
    title: {
      id: 'Event.alert.cancel.title',
      defaultMessage: 'Cancel Event'
    },
    text: {
      id: 'Event.alert.cancel.text',
      defaultMessage: "I don't want to take care of the event anymore"
    },
    confirm: {
      id: 'Event.alert.cancel.confirm',
      defaultMessage: 'Confirm'
    },
    cancel: {
      id: 'Event.alert.cancel.cancel',
      defaultMessage: 'Cancel'
    }
  }),
  buttonMsgs: {
    id: 'Event.button.cancel',
    defaultMessage: 'Cancel'
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

const finalise = {
  modalMsgs: defineMessages({
    title: {
      id: 'Event.alert.finalise.title',
      defaultMessage: 'Finalise Event'
    },
    text: {
      id: 'Event.alert.finalise.text',
      defaultMessage: 'I have finished taking care of the event'
    },
    confirm: {
      id: 'Event.alert.finalise.confirm',
      defaultMessage: 'Confirm'
    },
    cancel: {
      id: 'Event.alert.finalise.cancel',
      defaultMessage: 'Cancel'
    }
  }),
  buttonMsgs: {
    id: 'Event.button.finalise',
    defaultMessage: 'Finalise'
  }
}

const eventTakenMsgs = defineMessages({
  title: {
    id: 'Event.alert.taken.title',
    defaultMessage: 'Event taken already'
  },
  text: {
    id: 'Event.alert.taken.text',
    defaultMessage:
      'Sorry, this event was already accepted by another volunteer. Thank you for your time!'
  },
  confirm: {
    id: 'Event.alert.taken.confirm',
    defaultMessage: 'Ok'
  }
})

const eventTakeErrorMsgs = defineMessages({
  title: {
    id: 'Event.alert.takeError.title',
    defaultMessage: 'Error Accepting Event'
  },
  text: {
    id: 'Event.alert.takeError.text',
    defaultMessage:
      'Sorry, unable to accept this event. Please try again, if error persists please contact administrator'
  },
  confirm: {
    id: 'Event.alert.takeError.confirm',
    defaultMessage: 'Ok'
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
          {!navigation.state.params.isAssigned && (
            <Button transparent onPress={() => navigation.goBack()}>
              <Icon name={I18nManager.isRTL ? 'arrow-forward' : 'arrow-back'} />
            </Button>
          )}
        </Left>
        <Body>
          {navigation.state.params.isAssigned ? (
            <FormattedMessage
              id="Event.title.active"
              defaultMessage="Active event"
            >
              {txt => <Title>{txt}</Title>}
            </FormattedMessage>
          ) : (
            <FormattedMessage id="Event.title.inactive" defaultMessage="Event">
              {txt => <Title>{txt}</Title>}
            </FormattedMessage>
          )}
        </Body>
        <Right />
      </Header>
    )
  })

  componentWillMount() {
    const { navigation, event } = this.props
    const { setParams, state: { params: { isAssigned } } } = navigation
    if (event && event.isAssigned !== isAssigned) {
      setParams({ isAssigned: event.isAssigned })
    }
  }

  componentWillReceiveProps(nextProps) {
    const { navigation } = this.props
    const { event } = nextProps
    const { setParams, state: { params: { isAssigned } } } = navigation
    if (event && event.isAssigned !== isAssigned) {
      setParams({ isAssigned: event.isAssigned })
    }
  }

  handleRemoveEvent = () => {
    const { event, navigation } = this.props

    // Ignore Event
    event.remove()
    // Navigate back
    navigation.goBack()
  }

  render() {
    const {
      event,
      navigation,
      screenProps: { intl },
      isAssigned,
      isTaken
    } = this.props

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

    const okBtn = {
      ...(isAssigned ? finalise : accept),
      onPress: isAssigned
        ? () => {
            // Finalise Event, navigate to Feedback screen
            navigation.navigate('Feedback', {
              eventId: event.guid,
              action: 'finalise'
            })
          }
        : () => {
            // Accept Event
            event.accept().catch(({ code }) => {
              if (code === 'event-taken') {
                // Event was taken already, show alert message
                Alert.alert(
                  intl.formatMessage(eventTakenMsgs.title),
                  intl.formatMessage(eventTakenMsgs.text),
                  [
                    {
                      text: intl.formatMessage(eventTakenMsgs.confirm),
                      onPress: this.handleRemoveEvent
                    }
                  ],
                  { cancelable: false }
                )
              } else {
                // Error taking event (TODO Have a store for errors and use that in all scenarios?)
                Alert.alert(
                  intl.formatMessage(eventTakeErrorMsgs.title),
                  intl.formatMessage(eventTakeErrorMsgs.text),
                  [
                    {
                      text: intl.formatMessage(eventTakeErrorMsgs.confirm)
                    }
                  ],
                  { cancelable: false }
                )
              }
            })
          }
    }

    const cancelBtn = {
      ...(isAssigned ? cancel : ignore),
      onPress: isAssigned
        ? () => {
            // Navigate to feedback screen to explain why cancelling
            navigation.navigate('Feedback', {
              eventId: event.guid,
              action: 'unaccept'
            })
          }
        : this.handleRemoveEvent
    }

    return (
      <EventDetails event={event}>
        {isTaken ? (
          <TakenEventButtons onPress={this.handleRemoveEvent} />
        ) : (
          <ButtonsConfirmationBar ok={okBtn} cancel={cancelBtn} />
        )}
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
      isAssigned: event && event.isAssigned,
      isTaken: event && event.isTaken,
      event
    }
  }
)(EventScreen)
