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
import { ActivityIndicator } from 'react-native'
import { eventTypeMessage, eventTypeImg } from 'const'
import debounce from 'lodash.debounce'

import AlignedText from '../components/AlignedText'

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
    event: { id, type, city, more, timestamp, isLoading, isTaken }
  }) =>
    isLoading ? (
      <ListItem avatar>
        <Left>
          <ActivityIndicator size="large" />
        </Left>
        <Body>
          <FormattedMessage
            id="Home.event.loadingTitle"
            defaultMessage="Please wait, loading event..."
          >
            {txt => <AlignedText>{txt}</AlignedText>}
          </FormattedMessage>
          <AlignedText note />
        </Body>
        <Right />
      </ListItem>
    ) : (
      <ListItem
        avatar
        onPress={() => {
          onPress(id)
        }}
      >
        <Left>
          <Thumbnail source={eventTypeImg(type)} />
        </Left>
        <Body>
          <FormattedMessage {...eventTypeMessage(type)}>
            {eventTypeTxt => (
              <AlignedText>
                {eventTypeTxt} - {city}
              </AlignedText>
            )}
          </FormattedMessage>
          <AlignedText note>{more}</AlignedText>
        </Body>
        <Right>
          <FormattedRelative value={timestamp}>
            {relative => <AlignedText note>{relative}</AlignedText>}
          </FormattedRelative>
          {isTaken && (
            <FormattedMessage id="Home.event.taken" defaultMessage="TAKEN">
              {txt => (
                <AlignedText
                  note
                  style={{
                    padding: 3,
                    marginTop: 3,
                    backgroundColor: 'red',
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                >
                  {txt}
                </AlignedText>
              )}
            </FormattedMessage>
          )}
        </Right>
      </ListItem>
    )
)

@observer
class HomeScreen extends Component {
  static navigationOptions = ({
    navigation,
    screenProps: { toggleMute, isMuted }
  }) => ({
    header: (
      <Header>
        <Left>
          <Button transparent onPress={() => navigation.navigate('DrawerOpen')}>
            <Icon name="menu" />
          </Button>
        </Left>
        <Body>
          <FormattedMessage id="Home.title" defaultMessage="Home">
            {txt => <Title>{txt}</Title>}
          </FormattedMessage>
        </Body>
        <Right>
          <Button transparent onPress={toggleMute}>
            <Icon
              style={isMuted ? { color: 'red' } : {}}
              name={`ios-notifications${isMuted ? '-off' : ''}`}
            />
          </Button>
        </Right>
      </Header>
    )
  })

  handleEventItemPress = debounce(
    eventId => {
      this.props.navigation.navigate('Event', { eventId })
    },
    1000,
    { leading: true, trailing: false }
  )

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
  currentUser: stores.authStore.currentUser,
  hasEvents: stores.eventStore.hasEvents,
  allEvents: stores.eventStore.allEvents
}))(HomeScreen)
