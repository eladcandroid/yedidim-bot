import React from 'react'
import { inject, observer } from 'mobx-react/native'
import { reaction } from 'mobx'
import { Notifications } from 'expo'
import { Toast } from 'native-base'
import { NavigationActions } from 'react-navigation'

const withNotificationManager = WrappedComponent => {
  const Component = class extends React.Component {
    componentWillMount() {
      // Handle Notification received
      Notifications.addListener(this.handleNotification)

      // When authentication is done, check if user has
      //  event accepted, if yes navigate to event
      const { acceptedEventId } = this.props.currentUser
      this.handleAcceptedEventByUser(acceptedEventId)

      // If accepted event was changed during app usage,
      //  redirect user to accepted event page
      this.disposer = reaction(
        () => this.props.currentUser.acceptedEventId,
        this.handleAcceptedEventByUser
      )
    }

    componentWillUnmount() {
      this.disposer()
    }

    handleAcceptedEventByUser = eventId => {
      if (eventId) {
        this.props.addEventFromNotification(eventId)
        this.navigateToEvent({
          eventId
        })
      }
    }

    navigateToEvent = eventData => {
      const navigateAction = NavigationActions.reset({
        index: 1,
        actions: [
          NavigationActions.navigate({ routeName: 'Home' }),
          NavigationActions.navigate({ routeName: 'Event', params: eventData })
        ]
      })

      this.props.navigation.dispatch(navigateAction)
    }

    handleNotification = ({ origin, data, remote }) => {
      // If no data was sent, throw exception
      if (!data || !data.key) {
        throw new Error(
          `Notification is incomplete and lacking data, ignoring it : ${JSON.stringify(
            data
          )}`
        )
      }

      if (remote) {
        // Add event to store
        const { key } = data
        this.props.addEventFromNotification(key)

        // Only listen to remote notifications
        if (origin === 'received') {
          // The app if foregrounded
          Toast.show({
            text: 'New event received',
            position: 'bottom',
            buttonText: 'Show',
            type: 'warning',
            // duration: 10000,
            onClose: () => this.navigateToEvent({ eventId: key })
          })
        } else {
          // Origin is selected: comes from notification while in foreground
          this.navigateToEvent({ eventId: key })
        }
      }
    }

    render() {
      const { currentUser, addEventFromNotification, ...other } = this.props

      return <WrappedComponent {...other} />
    }
  }

  // As described at https://github.com/react-community/react-navigation/issues/90
  Component.router = WrappedComponent.router

  return inject(({ stores }) => ({
    addEventFromNotification: stores.eventStore.addEventFromNotification,
    currentUser: stores.authStore.currentUser
  }))(observer(Component))
}

export default withNotificationManager
