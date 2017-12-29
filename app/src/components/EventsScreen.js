import { StackNavigator } from 'react-navigation';
import EventsList from "./EventsList";
import EventDetails from './EventDetails';
import EventDetailsEditor from './EventDetailsEditor';

const EventsScreen = StackNavigator({
  EventList: {
    screen: EventsList,
    navigationOptions: {
      title: 'אירועים',
    }
  },
  EventDetails: {
    screen: EventDetails,
    navigationOptions: {
      title: 'פרטים',
    }
  },
  EventDetailsEditor: {
    screen: EventDetailsEditor,
    navigationOptions: {
      title: 'אירוע חדש',
    }
  }
});

export default EventsScreen;