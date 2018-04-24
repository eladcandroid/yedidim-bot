import React from 'react'
import AuthenticatedStack from 'layouts/AuthenticatedStack'
// import MainScreenNavigator from "../ChatScreen/index.js";
// import Profile from "../ProfileScreen/index.js";
import SideBar from 'screens/SideBar'
import { DrawerNavigator } from 'react-navigation'

const AuthenticatedDrawer = DrawerNavigator(
  {
    Home: { screen: AuthenticatedStack }
  },
  {
    contentComponent: props => <SideBar {...props} />,
    drawerWidth: 300
  }
)
export default AuthenticatedDrawer
