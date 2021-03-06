import { StackNavigator } from 'react-navigation'
import withNotificationManager from 'components/NotificationManager'
import withLocationManager from 'components/LocationManager'
import Home from 'screens/Home'
import Event from 'screens/Event'
import AboutStartach from 'screens/AboutStartach'
import NotificationTest from 'screens/Admin/NotificationTest'
import Settings from 'screens/Settings'
import AddCity from 'screens/AddCity'
import EditCity from 'screens/EditCity'

const AuthenticatedStack = StackNavigator({
  Home: { screen: Home },
  Event: { screen: Event },
  AboutStartach: { screen: AboutStartach },
  Settings: { screen: Settings },
  NotificationReport: { screen: NotificationTest },
  AddCity: { screen: AddCity },
  EditCity: { screen: EditCity }
})

export default withLocationManager(withNotificationManager(AuthenticatedStack))
