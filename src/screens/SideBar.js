import React from 'react'
import { Text, Container, List, ListItem, Content } from 'native-base'
import { Image } from 'react-native'
import { inject, observer } from 'mobx-react/native'
import { environment } from 'config'
// import styled from 'styled-components/native'
import Logo from './logo.png'

const isDevMode = () => environment() === 'development'

const SideBar = ({
  signOut,
  currentUser: { name, phone },
  addEventFromNotification,
  removeEvent,
  nextLanguage,
  toggleLanguage
}) => (
  <Container>
    <Content>
      <Image
        source={Logo}
        style={{
          height: 100,
          width: 260,
          marginTop: 20,
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
        <ListItem
          button
          onPress={async () => {
            await toggleLanguage()
          }}
        >
          <Text>{nextLanguage}</Text>
        </ListItem>
        <ListItem button onPress={signOut}>
          <Text>Sign out</Text>
        </ListItem>
        {isDevMode() && (
          <ListItem
            button
            onPress={() => {
              addEventFromNotification('-KwEbiayp9GQvqFESoFl')
            }}
          >
            <Text>DEBUG: New Event AsyncStorage</Text>
          </ListItem>
        )}
        {isDevMode() && (
          <ListItem
            button
            onPress={() => {
              removeEvent('-KwEbiayp9GQvqFESoFl')
            }}
          >
            <Text>DEBUG: Remove Sample Event</Text>
          </ListItem>
        )}
      </List>
    </Content>
  </Container>
)

export default inject(({ stores }) => ({
  signOut: stores.authStore.signOut,
  currentUser: stores.authStore.currentUser,
  addEventFromNotification: stores.eventStore.addEventFromNotification,
  removeEvent: stores.eventStore.removeEvent,
  nextLanguage: stores.nextLanguage,
  toggleLanguage: stores.toggleLanguage
}))(observer(SideBar))
