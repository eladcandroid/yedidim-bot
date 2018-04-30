import { StackNavigator } from 'react-navigation'
import withNotificationManager from 'components/NotificationManager'
import Home from 'screens/Home'
import Event from 'screens/Event'
import Feedback from 'screens/Feedback'
import AboutStartach from 'screens/AboutStartach'
import NotificationTest from 'screens/Admin/NotificationTest'

const AuthenticatedStack = StackNavigator({
  Home: { screen: Home },
  Event: { screen: Event },
  Feedback: { screen: Feedback },
  AboutStartach: { screen: AboutStartach },
  NotificationReport: { screen: NotificationTest }
})

export default withNotificationManager(AuthenticatedStack)
