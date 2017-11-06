import React from 'react'
import HomeNavigator from 'Screens/HomeNavigator'
// import MainScreenNavigator from "../ChatScreen/index.js";
// import Profile from "../ProfileScreen/index.js";
import SideBar from 'Screens/SideBar'
import { DrawerNavigator } from 'react-navigation'
import withNotificationManager from 'Components/NotificationManager'

const AuthenticatedRouter = DrawerNavigator(
  {
    Home: { screen: HomeNavigator }
    // Chat: { screen: MainScreenNavigator },
    // Profile: { screen: Profile }
  },
  {
    contentComponent: props => <SideBar {...props} />,
    drawerPosition: 'right',
    drawerWidth: 300
  }
)
export default withNotificationManager(AuthenticatedRouter)
