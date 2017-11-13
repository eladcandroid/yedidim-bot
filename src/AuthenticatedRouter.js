import React from 'react'
import HomeNavigator from 'screens/HomeNavigator'
// import MainScreenNavigator from "../ChatScreen/index.js";
// import Profile from "../ProfileScreen/index.js";
import SideBar from 'screens/SideBar'
import { DrawerNavigator } from 'react-navigation'

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
export default AuthenticatedRouter
