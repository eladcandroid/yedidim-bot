import React from 'react'
import BackgroundGeolocation from 'react-native-background-geolocation'
import { getUserIdToken } from 'io/api'
import Sentry from 'sentry-expo'
import { config } from 'config'

// TODO Create function to retrieve and update the geolocation for the user
// TODO Pass the user token from the client to the backend to ensure security
// TODO Make it work on Android
// https://firebase.google.com/docs/auth/admin/verify-id-tokens

const withLocationManagement = WrappedComponent => {
  const Component = class extends React.Component {
    async componentWillMount() {
      //
      // 1.  Wire up event-listeners
      //

      // This handler fires whenever bgGeo receives a location update.
      BackgroundGeolocation.on('location', this.onLocation, this.onError)

      // This handler fires when movement states changes (stationary->moving; moving->stationary)
      // BackgroundGeolocation.on('motionchange', this.onMotionChange)

      // This event fires when a change in motion activity is detected
      // BackgroundGeolocation.on('activitychange', this.onActivityChange)

      // This event fires when the user toggles location-services authorization
      // BackgroundGeolocation.on('providerchange', this.onProviderChange)

      try {
        // Assuming we are already authenticated
        const userIdToken = await getUserIdToken()

        //
        // 2.  Execute #ready method (required)
        //
        BackgroundGeolocation.ready(
          {
            // Geolocation Config
            reset: true,
            desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_MEDIUM,
            distanceFilter: 250,
            // Activity Recognition
            stopTimeout: 5,
            // Application config
            debug: true, // <-- enable this hear sounds for background-geolocation life-cycle.
            logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
            stopOnTerminate: false, // <-- Allow the background-service to continue tracking when user closes the app.
            startOnBoot: true, // <-- Auto start tracking when device is powered-up.
            // HTTP / SQLite config
            url: `${config().functionsUrl}/saveUserLocation`,
            batchSync: false, // <-- [Default: false] Set true to sync locations to server in a single HTTP request.
            autoSync: true, // <-- [Default: true] Set true to sync each location to server as it arrives.
            params: {
              // <-- Optional HTTP params
              authToken: userIdToken
            }
          },
          state => {
            console.log(
              '- BackgroundGeolocation is configured and ready: ',
              state.enabled,
              userIdToken
            )

            if (!state.enabled) {
              //
              // 3. Start tracking!
              //
              BackgroundGeolocation.start(() => {
                console.log('- Start success', userIdToken)
              })
            }
          }
        )
      } catch (error) {
        console.warn(
          'Unable to retrieve user token, background location not started',
          error
        )
        Sentry.captureException(error)
      }
    }

    componentWillUnmount() {
      BackgroundGeolocation.removeListeners()
    }

    onLocation = location => {
      console.log('- [event] location: ', location)
    }
    onError = error => {
      Sentry.captureMessage(`- [event] location error: ${error}`)
      console.warn('- [event] location error ', error)
    }
    // onActivityChange = activity => {
    //   console.log('- [event] activitychange: ', activity) // eg: 'on_foot', 'still', 'in_vehicle'
    // }
    // onProviderChange = provider => {
    //   console.log('- [event] providerchange: ', provider)
    // }
    // onMotionChange = location => {
    //   console.log('- [event] motionchange: ', location.isMoving, location)
    // }

    render() {
      return <WrappedComponent {...this.props} />
    }
  }

  // As described at https://github.com/react-community/react-navigation/issues/90
  Component.router = WrappedComponent.router

  return Component
}

export default withLocationManagement
