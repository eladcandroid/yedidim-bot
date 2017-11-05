import React, { Component } from 'react'
import { Text } from 'react-native'
import { Button } from 'native-base'
import styled from 'styled-components/native'
import { inject, observer } from 'mobx-react/native'

const StyledView = styled.View`
  flex: 1;
  background-color: #fff;
  align-items: center;
  justify-content: center;
`

@observer
class HomeScreen extends Component {
  static navigationOptions = {
    title: 'Home'
  }

  render() {
    const { authUser, signOut } = this.props

    return (
      <StyledView>
        <Text>There are no events</Text>
        <Text>You are logged in as: {authUser.phoneNumber}</Text>
        <Button success onPress={signOut}>
          <Text>Log out</Text>
        </Button>
      </StyledView>
    )
  }
}

export default inject(stores => ({
  authUser: stores.store.authUser,
  signOut: stores.store.signOut
}))(HomeScreen)
