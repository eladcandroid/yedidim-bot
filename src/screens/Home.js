import React, { Component } from 'react'
import styled from 'styled-components/native'
import { inject, observer } from 'mobx-react/native'
import { FormattedMessage, FormattedRelative } from 'react-intl'
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
  List,
  ListItem,
  Thumbnail
} from 'native-base'

const MessageView = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 15px 0;
`

// TODO Move saveNotificationToken to be executed after signin, if error exists then show button on home asking user to notification access (trigger again)
// TODO Don't use once to listen to user changes, that way we can have a computed property to enable notifications (Notification Store - will be used for muted)
// TODO Remove token after user logout
// TODO On notification, save the event data to event store and sync with firebase?

const EventItem = observer(
  ({
    onPress,
    event: { guid, eventTypeImage, caller, more, timestamp, eventType }
  }) => (
    <ListItem
      avatar
      onPress={() => {
        onPress(guid)
      }}
    >
      <Left>
        <Thumbnail
          source={{
            uri: eventTypeImage
          }}
        />
      </Left>
      <Body>
        <Text>
          {eventType} : {caller}
        </Text>
        <Text note>{more}</Text>
      </Body>
      <Right>
        <FormattedRelative value={timestamp}>
          {relative => <Text note>{relative}</Text>}
        </FormattedRelative>
      </Right>
    </ListItem>
  )
)

@observer
class HomeScreen extends Component {
  static navigationOptions = ({ navigation }) => ({
    header: (
      <Header>
        <Left />
        <Body>
          <FormattedMessage id="Home.title" defaultMessage="Home">
            {txt => <Title>{txt}</Title>}
          </FormattedMessage>
        </Body>
        <Right>
          <Button transparent onPress={() => navigation.navigate('DrawerOpen')}>
            <Icon name="menu" />
          </Button>
        </Right>
      </Header>
    )
  })

  handleEventItemPress = eventId => {
    this.props.navigation.navigate('Event', { eventId })
  }

  render() {
    const { hasEvents, allEvents } = this.props

    return (
      <Container>
        <Content style={{ backgroundColor: '#fff' }}>
          {hasEvents ? (
            <List
              dataArray={allEvents}
              renderRow={event => (
                <EventItem event={event} onPress={this.handleEventItemPress} />
              )}
            />
          ) : (
            <MessageView>
              <FormattedMessage
                id="Home.noevents"
                defaultMessage="Sorry, no events were found"
              >
                {txt => <Text>{txt}</Text>}
              </FormattedMessage>
            </MessageView>
          )}
        </Content>
      </Container>
    )
  }
}

export default inject(({ stores }) => ({
  hasEvents: stores.eventStore.hasEvents,
  allEvents: stores.eventStore.allEvents
}))(HomeScreen)
