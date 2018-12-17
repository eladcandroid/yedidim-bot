import { StackNavigator } from 'react-navigation'
import withNotificationManager from 'components/NotificationManager'
import withLocationManager from 'components/LocationManager'
import Home from 'screens/Home'
import Event from 'screens/Event'
import AboutStartach from 'screens/AboutStartach'
import NotificationTest from 'screens/Admin/NotificationTest'

const AuthenticatedStack = StackNavigator({
  Home: { screen: Home },
  Event: { screen: Event },
  AboutStartach: { screen: AboutStartach },
  NotificationReport: { screen: NotificationTest }
})

export default withLocationManager(withNotificationManager(AuthenticatedStack))
