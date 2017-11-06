import React, { Component } from 'react'
import styled from 'styled-components/native'
import { inject, observer } from 'mobx-react/native'
import { FormattedMessage } from 'react-intl'
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
            <FormattedMessage
              id="welcome"
              values={{ name: `${user.FirstName} ${user.LastName}` }}
            >
              {txt => <H3>{txt}</H3>}
            </FormattedMessage>
            <Button
              block
              onPress={() => {
                this.props.navigation.navigate('Event', { eventId: 'test123' })
              }}
            >
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
