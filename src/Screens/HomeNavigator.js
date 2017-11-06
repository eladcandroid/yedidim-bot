import React from 'react'
import { StackNavigator } from 'react-navigation'
import Home from './Home'

const HomeNavigator = StackNavigator({
  Home: { screen: Home }
  //   EditScreenOne: { screen: EditScreenOne },
  //   EditScreenTwo: { screen: EditScreenTwo }
})

export default HomeNavigator
