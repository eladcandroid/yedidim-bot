import React from 'react'
import { Constants } from 'expo'
import {
  Text,
  Container,
  List,
  ListItem,
  Content,
  Icon,
  Body,
  Left,
  Separator
} from 'native-base'
import { Image } from 'react-native'
import { inject, observer } from 'mobx-react/native'
import { FormattedMessage } from 'react-intl'
import { NavigationActions } from 'react-navigation'
import Logo from './logo.png'

const SideBar = ({
  signOut,
  currentUser: { name, phone },
  nextLanguage,
  toggleLanguage,
  navigation
}) => (
  <Container>
    <Content>
      <Image
        source={Logo}
        style={{
          height: 200,
          width: 260,
          marginTop: 40,
          marginLeft: 20,
          marginRight: 20,
          justifyContent: 'center',
          alignItems: 'center'
        }}
        resizeMode="contain"
      />
      <List style={{ marginTop: 20 }}>
        <ListItem>
          <Text>
            {name} {phone && `(${phone})`}
          </Text>
        </ListItem>
        <ListItem>
          <Text>v{Constants.manifest.version}</Text>
        </ListItem>
        <ListItem
          button
          onPress={async () => {
            await toggleLanguage()
          }}
        >
          <Text>{nextLanguage}</Text>
        </ListItem>
        <ListItem button onPress={signOut}>
          <FormattedMessage
            id="Authentication.signout"
            defaultMessage="Sign out"
          >
            {txt => <Text>{txt}</Text>}
          </FormattedMessage>
        </ListItem>
        <ListItem
          button
          onPress={() => {
            navigation.dispatch(
              NavigationActions.navigate({
                routeName: 'AboutStartach'
              })
            )
          }}
        >
          <FormattedMessage
            id="Sidebar.aboutStartach"
            defaultMessage="About Startach"
          >
            {txt => <Text>{txt}</Text>}
          </FormattedMessage>
        </ListItem>
        <Separator bordered>
          <FormattedMessage id="Sidebar.admin" defaultMessage="Administrators">
            {txt => <Text>{txt}</Text>}
          </FormattedMessage>
        </Separator>
        <ListItem
          button
          icon
          onPress={() => {
            navigation.dispatch(
              NavigationActions.navigate({
                routeName: 'NotificationReport'
              })
            )
          }}
        >
          <Body>
            <FormattedMessage
              id="Sidebar.admin.notificationReport"
              defaultMessage="Notification Report"
            >
              {txt => <Text>{txt}</Text>}
            </FormattedMessage>
          </Body>
          <Left>
            <Icon name="ios-notifications" />
          </Left>
        </ListItem>
      </List>
    </Content>
  </Container>
)

export default inject(({ stores }) => ({
  signOut: stores.authStore.signOut,
  currentUser: stores.authStore.currentUser,
  nextLanguage: stores.nextLanguage,
  toggleLanguage: stores.toggleLanguage
}))(observer(SideBar))
