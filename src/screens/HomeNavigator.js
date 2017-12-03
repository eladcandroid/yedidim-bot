import { StackNavigator } from 'react-navigation'
import withNotificationManager from 'components/NotificationManager'
import Home from './Home'
import Event from './Event'
import Feedback from './Feedback'

const HomeNavigator = StackNavigator({
  Home: { screen: Home },
  Event: { screen: Event },
  Feedback: { screen: Feedback }
})

export default withNotificationManager(HomeNavigator)
