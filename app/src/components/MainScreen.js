import { TabNavigator } from 'react-navigation';
import EventsScreen from "./EventsScreen";
import ProfileScreen from "./ProfileScreen";


export default MainScreen = TabNavigator({
  Events: {
    screen: EventsScreen,
  },
  Profile: {
    screen: ProfileScreen,
  },
});
