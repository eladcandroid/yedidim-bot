import React from 'react'
import { Text, Container, List, ListItem, Content } from 'native-base'
import { Image } from 'react-native'
import { inject, observer } from 'mobx-react/native'
// import styled from 'styled-components/native'
import Logo from './logo.png'

const SideBar = ({ signOut, user: { FirstName, LastName, MobilePhone } }) => (
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
            {FirstName} {LastName} {MobilePhone && `(${MobilePhone})`}
          </Text>
        </ListItem>
        <ListItem button onPress={signOut}>
          <Text>Sign out</Text>
        </ListItem>
      </List>
    </Content>
  </Container>
)

export default inject(({ Authentication }) => ({
  signOut: Authentication.signOut,
  user: Authentication.user
}))(observer(SideBar))
