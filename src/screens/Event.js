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
class EventScreen extends Component {
  static navigationOptions = ({ navigation }) => ({
    header: (
      <Header>
        <Left>
          <Button transparent onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" />
          </Button>
        </Left>
        <Body>
          <Title>Event</Title>
        </Body>
        <Right />
      </Header>
    )
  })

  render() {
    const { state: { params: { eventId } } } = this.props.navigation

    return (
      <Container>
        <Content padder style={{ backgroundColor: '#fff' }}>
          <StyledView>
            <H3>Event page for {eventId}</H3>
          </StyledView>
        </Content>
      </Container>
    )
  }
}

export default inject(({ stores }) => ({
  currentUser: stores.authStore.currentUser,
  events: stores.eventStore.events
}))(EventScreen)
