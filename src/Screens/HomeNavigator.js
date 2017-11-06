import React from 'react'
import { StackNavigator } from 'react-navigation'
import Home from './Home'
import Event from './Event'

const HomeNavigator = StackNavigator({
  Home: { screen: Home },
  Event: { screen: Event }
})

export default HomeNavigator
