import React, { Component } from 'react'
import styled from 'styled-components/native'
import { inject, observer } from 'mobx-react/native'
import {
  Button,
  Text,
  Container,
  Body,
  Content,
  Header,
  Title,
  Left,
  Icon,
  Right
} from 'native-base'

const StyledView = styled.View`
  flex: 1;
  background-color: #fff;
  align-items: center;
  justify-content: center;
`

@observer
class HomeScreen extends Component {
  render() {
    const { user } = this.props

    return (
      <Container>
        <Header>
          <Left />
          <Body>
            <Title>Home</Title>
          </Body>
          <Right>
            <Button
              transparent
              onPress={() => this.props.navigation.navigate('DrawerOpen')}
            >
              <Icon name="menu" />
            </Button>
          </Right>
        </Header>
        <Content padder>
          <StyledView>
            <Text>
              Welcome {user.FirstName} {user.LastName}
            </Text>
          </StyledView>
        </Content>
      </Container>
    )
  }
}

export default inject(({ Authentication }) => ({
  user: Authentication.user
}))(HomeScreen)
