import React from 'react'
import { inject, observer } from 'mobx-react/native'
import { Notifications } from 'expo'
import { Toast } from 'native-base'
import { NavigationActions } from 'react-navigation'

const withNotificationManager = WrappedComponent => {
  const Component = class extends React.Component {
    componentWillMount() {
      // Save notification token when application mounts
      this.props.saveNotificationToken()

      // Handle Notification received
      Notifications.addListener(this.handleNotification)
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
            onClose: () => {
              const navigateAction = NavigationActions.navigate({
                routeName: 'Event',
                params: data
              })

              this.props.navigation.dispatch(navigateAction)
            }
          })
        }
      }
    }

    render() {
      return <WrappedComponent {...this.props} />
    }
  }

  return inject(({ Authentication }) => ({
    saveNotificationToken: Authentication.saveNotificationToken
  }))(observer(Component))
}

export default withNotificationManager
