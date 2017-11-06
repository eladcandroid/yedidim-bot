import React, { Component } from 'react'
import styled from 'styled-components/native'
import { inject, observer } from 'mobx-react/native'
import {
  Button,
  Container,
  Body,
  Content,
  Header,
  Title,
  Left,
  Icon,
  Right,
  Text,
  H3
} from 'native-base'

const StyledView = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  margin: 20px 0;
`

// TODO Move saveNotificationToken to be executed after signin, if error exists then show button on home asking user to notification access (trigger again)
// TODO Don't use once to listen to user changes, that way we can have a computed property to enable notifications (Notification Store - will be used for muted)
// TODO Remove token after user logout
// TODO On notification, save the event data to event store and sync with firebase?

@observer
class HomeScreen extends Component {
  static navigationOptions = ({ navigation }) => ({
    header: (
      <Header>
        <Left />
        <Body>
          <Title>Home</Title>
        </Body>
        <Right>
          <Button transparent onPress={() => navigation.navigate('DrawerOpen')}>
            <Icon name="menu" />
          </Button>
        </Right>
      </Header>
    )
  })

  render() {
    const { user } = this.props

    return (
      <Container>
        <Content padder style={{ backgroundColor: '#fff' }}>
          <StyledView>
            <H3>
              Welcome {user.FirstName} {user.LastName}
            </H3>
            <Button block onPress={() => {}}>
              <Text>Open Event</Text>
            </Button>
          </StyledView>
        </Content>
      </Container>
    )
  }
}

export default inject(({ Authentication }) => ({
  user: Authentication.user
}))(HomeScreen)
