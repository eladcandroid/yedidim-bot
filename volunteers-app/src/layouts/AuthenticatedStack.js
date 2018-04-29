import { StackNavigator } from 'react-navigation'
import withNotificationManager from 'components/NotificationManager'
import Home from 'screens/Home'
import Event from 'screens/Event'
import Feedback from 'screens/Feedback'
import AboutStartach from 'screens/AboutStartach'
import NotificationReport from 'screens/Admin/NotificationReport'

const AuthenticatedStack = StackNavigator({
  Home: { screen: Home },
  Event: { screen: Event },
  Feedback: { screen: Feedback },
  AboutStartach: { screen: AboutStartach },
  NotificationReport: { screen: NotificationReport }
})

export default withNotificationManager(AuthenticatedStack)
