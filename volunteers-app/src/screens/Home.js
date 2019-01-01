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
import { ActivityIndicator, RefreshControl } from 'react-native'
import debounce from 'lodash.debounce'
import format from 'date-fns/format'
import { trackEvent } from 'io/analytics'

import AlignedText from 'components/AlignedText'
import NotificationBadge from 'components/NotificationBadge'

const MessageView = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 15px 0;
`

const LastUpdatedView = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 5px 0;
  border-bottom-width: 1px
  border-bottom-color: #D3D3D3; 
`

// TODO Move saveNotificationToken to be executed after signin, if error exists then show button on home asking user to notification access (trigger again)
// TODO Don't use once to listen to user changes, that way we can have a computed property to enable notifications (Notification Store - will be used for muted)
// TODO Remove token after user logout
// TODO On notification, save the event data to event store and sync with firebase?

const distanceToString = distance => {
  if (distance < 1) {
    return (
      <FormattedMessage
        id="Home.event.distance.ms"
        defaultMessage="{formattedDistance} m"
        values={{ formattedDistance: (distance * 1000).toFixed(0).toString() }}
      >
        {txt => <AlignedText note>{txt}</AlignedText>}
      </FormattedMessage>
    )
  }
  return (
    <FormattedMessage
      id="Home.event.distance.kms"
      defaultMessage="{formattedDistance} km"
      values={{ formattedDistance: distance.toFixed(2).toString() }}
    >
      {txt => <AlignedText note>{txt}</AlignedText>}
    </FormattedMessage>
  )
}

const EventItem = observer(
  ({
    onPress,
    isAdmin,
    event: {
      id,
      carType,
      categoryName,
      categoryImg,
      displayAddress,
      more,
      timestamp,
      isLoading,
      isTaken,
      distance,
      sentNotification,
      receivedNotification,
      errorNotification,
      assignedTo
    }
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
          <Thumbnail small source={categoryImg} />
        </Left>
        <Body>
          <AlignedText>
            {categoryName} - {displayAddress} {carType && `(${carType})`}
          </AlignedText>
          <AlignedText note>{more}</AlignedText>
          {isAdmin && (
            <NotificationBadge
              sent={sentNotification}
              error={errorNotification}
              received={receivedNotification}
            />
          )}
        </Body>
        <Right>
          <FormattedRelative value={timestamp}>
            {relative => <AlignedText note>{relative}</AlignedText>}
          </FormattedRelative>
          {distance && distanceToString(distance)}
          {isTaken && (
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
              נלקח
              {assignedTo && assignedTo.name && ` ע״י ${assignedTo.name}`}
            </AlignedText>
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
          <Button
            transparent
            onPress={() => {
              trackEvent('Navigation', { page: 'Sidebar' })
              navigation.navigate('DrawerOpen')
            }}
          >
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

  state = {
    refreshing: false
  }

  componentWillMount() {
    this.handleRefresh()
  }

  handleRefresh = async () => {
    try {
      this.setState(() => ({ refreshing: true }))
      await this.props.eventStore.loadLatestOpenEvents()
    } finally {
      this.setState(() => ({
        refreshing: false
      }))
    }
  }

  handleEventItemPress = debounce(
    eventId => {
      trackEvent('Navigation', { page: 'EventPage', eventId })
      this.props.navigation.navigate('Event', { eventId })
    },
    1000,
    { leading: true, trailing: false }
  )

  render() {
    const {
      eventStore: {
        hasEvents,
        sortedEventsByStatusAndTimestamp,
        lastUpdatedDate
      },
      currentUser
    } = this.props
    const { refreshing } = this.state

    return (
      <Container>
        <Content
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={this.handleRefresh}
            />
          }
          style={{ backgroundColor: '#fff' }}
        >
          {!refreshing && (
            <LastUpdatedView>
              <Text>מעודכן ל{format(lastUpdatedDate, 'H:mm')}</Text>
            </LastUpdatedView>
          )}
          {hasEvents && (
            <List
              dataArray={sortedEventsByStatusAndTimestamp}
              renderRow={event => (
                <EventItem
                  event={event}
                  onPress={this.handleEventItemPress}
                  isAdmin={currentUser.isAdmin}
                />
              )}
            />
          )}
          {!hasEvents &&
            !refreshing && (
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
  eventStore: stores.eventStore
}))(HomeScreen)
