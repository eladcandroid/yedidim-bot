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
  H3,
  List,
  ListItem,
  Thumbnail
} from 'native-base'

const StyledView = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 15px 0;
  border-bottom-width: 1px;
  border-bottom-color: #ccc;
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

  render() {
    const { currentUser } = this.props

    return (
      <Container>
        <Content style={{ backgroundColor: '#fff' }}>
          <StyledView>
            <FormattedMessage
              id="Home.welcome"
              defaultMessage="Welcome {name}"
              values={{ name: `${currentUser.name}` }}
            >
              {txt => <H3>{txt}</H3>}
            </FormattedMessage>
          </StyledView>
          <List>
            <ListItem avatar>
              <Left>
                <Thumbnail
                  source={{
                    uri:
                      'https://static.pakwheels.com/2016/05/tyre-repair-kit.jpg'
                  }}
                />
              </Left>
              <Body>
                <Text>Kumar Pratik</Text>
                <Text note>
                  Doing what you like will always keep you happy . .
                </Text>
              </Body>
              <Right>
                <Text note>3:43 pm</Text>
              </Right>
            </ListItem>
          </List>
        </Content>
      </Container>
    )
  }
}

export default inject(({ stores }) => ({
  currentUser: stores.authStore.currentUser
}))(HomeScreen)
