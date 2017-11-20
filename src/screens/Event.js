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
  Grid,
  Col,
  Row,
  Right,
  Text,
  H2,
  Card,
  CardItem,
  Thumbnail
} from 'native-base'
import { MapView } from 'expo'

const InfoItem = styled.View`
  margin: 10px 10px;
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
        <Content style={{ backgroundColor: '#fff' }}>
          <Grid>
            <Row>
              <Col size={1}>
                <InfoItem>
                  <Thumbnail
                    source={{
                      uri:
                        'https://static.pakwheels.com/2016/05/tyre-repair-kit.jpg'
                    }}
                  />
                </InfoItem>
              </Col>
              <Col size={3}>
                <InfoItem>
                  <H2>{`${type}`}</H2>
                  <Text note>{`10 minutes ago - ${timestamp}`}</Text>
                </InfoItem>
              </Col>
            </Row>
            <Row>
              <Col>
                <MapView
                  style={{ height: 200, flex: 1 }}
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
              </Col>
            </Row>
            <Row>
              <Col>
                <InfoItem>
                  <BoldText>Description:</BoldText>
                  <Text>{more}</Text>
                </InfoItem>
              </Col>
            </Row>
            <Row>
              <Col>
                <InfoItem>
                  <BoldText>Location:</BoldText>
                  <Text>{fullAddress}</Text>
                </InfoItem>
              </Col>
            </Row>
            <Row>
              <Col>
                <InfoItem>
                  <BoldText>Name:</BoldText>
                  <Text>{caller}</Text>
                </InfoItem>
              </Col>
            </Row>
            <Row>
              <Col>
                <InfoItem>
                  <BoldText>Phone:</BoldText>
                  <Text>{phone}</Text>
                </InfoItem>
              </Col>
            </Row>
            <Row>
              <Col>
                <InfoItem>
                  <BoldText>Car type:</BoldText>
                  <Text>{carType}</Text>
                </InfoItem>
              </Col>
            </Row>
            <Row>
              <Col>
                <InfoItem>
                  <Button block info>
                    <Icon name="md-map" />
                    <Text>Navigate to location</Text>
                  </Button>
                </InfoItem>
              </Col>
            </Row>
            <Row>
              <Col>
                <InfoItem>
                  <Button block success>
                    <Icon name="md-call" />
                    <Text>Call Person</Text>
                  </Button>
                </InfoItem>
              </Col>
            </Row>
            <Row>
              <Col>
                <Button full large block danger>
                  <Icon name="md-close-circle" />
                  <Text>Ignore</Text>
                </Button>
              </Col>
              <Col>
                <Button full large block success>
                  <Icon name="md-checkmark-circle" />
                  <Text>Accept</Text>
                </Button>
              </Col>
            </Row>
          </Grid>
        </Content>
      </Container>
    )
  }
}

export default inject(({ stores }) => ({
  currentUser: stores.authStore.currentUser,
  findById: stores.eventStore.findById
}))(EventScreen)
