import { StackNavigator } from 'react-navigation'
import withNotificationManager from 'Components/NotificationManager'
import Home from './Home'
import Event from './Event'

const HomeNavigator = StackNavigator({
  Home: { screen: Home },
  Event: { screen: Event }
})

export default withNotificationManager(HomeNavigator)
