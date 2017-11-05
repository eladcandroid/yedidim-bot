import React from 'react'
import HomeScreen from 'Screens/Home'
// import MainScreenNavigator from "../ChatScreen/index.js";
// import Profile from "../ProfileScreen/index.js";
import SideBar from 'Screens/SideBar'
import { DrawerNavigator } from 'react-navigation'

const AuthenticatedRouter = DrawerNavigator(
  {
    Home: { screen: HomeScreen }
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
