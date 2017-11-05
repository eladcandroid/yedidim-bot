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
    const { user, signOut } = this.props

    return (
      <StyledView>
        <Text>
          Welcome {user.FirstName} {user.LastName}
        </Text>
        <Button success onPress={signOut}>
          <Text>Log out</Text>
        </Button>
      </StyledView>
    )
  }
}

export default inject(({ Authentication }) => ({
  user: Authentication.user,
  signOut: Authentication.signOut
}))(HomeScreen)
