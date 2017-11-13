import React from 'react'
import { inject, observer } from 'mobx-react/native'
import { Notifications } from 'expo'
import { Toast } from 'native-base'
import { NavigationActions } from 'react-navigation'

const withNotificationManager = WrappedComponent => {
  const Component = class extends React.Component {
    componentWillMount() {
      // Handle Notification received
      Notifications.addListener(this.handleNotification)
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
      if (remote) {
        // Only listen to remote notifications
        if (origin === 'received') {
          // The app if foregrounded
          Toast.show({
            text: 'New event received',
            position: 'bottom',
            buttonText: 'Show',
            type: 'warning',
            // duration: 10000,
            onClose: () => this.navigateToEvent(data)
          })
        } else {
          // Origin is selected: comes from notification while in foreground
          this.navigateToEvent(data)
        }
      }
    }

    render() {
      const { saveNotificationToken, ...other } = this.props
      return <WrappedComponent {...other} />
    }
  }

  // As described at https://github.com/react-community/react-navigation/issues/90
  Component.router = WrappedComponent.router

  return Component
}

export default withNotificationManager
