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
  H2,
  Card,
  CardItem,
  Thumbnail
} from 'native-base'
import { MapView } from 'expo'

const InfoItem = styled.View`
  margin: 10px 0;
`

const BoldText = styled.Text`
  font-weight: bold;
  font-size: 16px;
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
          <Title>Event Details</Title>
        </Body>
        <Right />
      </Header>
    )
  })

  render() {
    const { navigation, findById } = this.props
    const { state: { params: { eventId } } } = navigation
    const {
      type,
      timestamp,
      lat,
      lon,
      caller,
      more,
      fullAddress,
      phone,
      carType
    } = findById(eventId)

    return (
      <Container>
        <Content padder style={{ backgroundColor: '#fff' }}>
          <Card style={{ flex: 0 }}>
            <CardItem>
              <Left>
                <Thumbnail
                  source={{
                    uri:
                      'https://static.pakwheels.com/2016/05/tyre-repair-kit.jpg'
                  }}
                />
                <Body>
                  <H2>{`${type}`}</H2>
                  <Text note>{`10 minutes ago - ${timestamp}`}</Text>
                </Body>
              </Left>
            </CardItem>
            <CardItem>
              <Body>
                <MapView
                  style={{ height: 200, width: '100%', flex: 1 }}
                  region={{
                    latitude: lat,
                    longitude: lon,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421
                  }}
                  showsMyLocationButton
                >
                  <MapView.Marker
                    coordinate={{ latitude: lat, longitude: lon }}
                    title={caller}
                    description={more}
                  />
                </MapView>
                <InfoItem>
                  <BoldText>Description:</BoldText>
                  <Text>{more}</Text>
                </InfoItem>
                <InfoItem>
                  <BoldText>Location:</BoldText>
                  <Text>{fullAddress}</Text>
                </InfoItem>
                <InfoItem>
                  <BoldText>Name:</BoldText>
                  <Text>{caller}</Text>
                </InfoItem>
                <InfoItem>
                  <BoldText>Phone:</BoldText>
                  <Text>{phone}</Text>
                </InfoItem>
                <InfoItem>
                  <BoldText>Car type:</BoldText>
                  <Text>{carType}</Text>
                </InfoItem>
              </Body>
            </CardItem>
            <CardItem>
              <Body>
                <Button block info>
                  <Icon name="md-map" />
                  <Text>Navigate to location</Text>
                </Button>
              </Body>
            </CardItem>
            <CardItem>
              <Body>
                <Button block success>
                  <Icon name="md-call" />
                  <Text>Call Person</Text>
                </Button>
              </Body>
            </CardItem>
            <CardItem>
              <Left>
                <Button danger>
                  <Icon name="md-close-circle" />
                  <Text>Ignore</Text>
                </Button>
              </Left>
              <Right>
                <Button success>
                  <Icon name="md-checkmark-circle" />
                  <Text>Accept</Text>
                </Button>
              </Right>
            </CardItem>
          </Card>
        </Content>
      </Container>
    )
  }
}

export default inject(({ stores }) => ({
  currentUser: stores.authStore.currentUser,
  findById: stores.eventStore.findById
}))(EventScreen)
