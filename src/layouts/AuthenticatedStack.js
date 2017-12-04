import { StackNavigator } from 'react-navigation'
import withNotificationManager from 'components/NotificationManager'
import Home from '../screens/Home'
import Event from '../screens/Event'
import Feedback from '../screens/Feedback'

const AuthenticatedStack = StackNavigator({
  Home: { screen: Home },
  Event: { screen: Event },
  Feedback: { screen: Feedback }
})

export default withNotificationManager(AuthenticatedStack)
