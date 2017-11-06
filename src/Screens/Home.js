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

// TODO Move saveNotificationToken to be executed after signin, if error exists then show button on home asking user to notification access (trigger again)
// TODO Don't use once to listen to user changes, that way we can have a computed property to enable notifications (Notification Store - will be used for muted)
// TODO Remove token after user logout
// TODO On notification, save the event data to event store and sync with firebase?

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
