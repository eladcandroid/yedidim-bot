import React from 'react'
import styled from 'styled-components/native'
import { observer } from 'mobx-react/native'
import { FormattedMessage, FormattedRelative } from 'react-intl'
import { Linking, View } from 'react-native'

import {
  Button,
  Container,
  Content,
  Icon,
  Grid,
  Col,
  Row,
  Text,
  H2,
  Thumbnail
} from 'native-base'
import { MapView } from 'expo'

import NotificationBadge from 'components/NotificationBadge'
import TextFieldRow from './TextFieldRow'
import AlignedText from './AlignedText'

const MarginView = styled.View`
  margin: 10px 10px;
`
const EventDetails = ({
  isAdmin,
  event: {
    categoryName,
    categoryImg,
    timestamp,
    lat,
    lon,
    caller,
    more,
    displayAddress,
    phone,
    privateInfo,
    carType,
    isAssigned,
    dispatcher,
    sentNotification,
    errorNotification,
    receivedNotification
  },
  children
}) => (
  <Container>
    <Content style={{ flex: 1, backgroundColor: '#fff' }}>
      <Grid>
        <Row>
          <Col size={1}>
            <MarginView>
              <Thumbnail source={categoryImg} />
            </MarginView>
          </Col>
          <Col size={3}>
            <MarginView>
              <H2 style={{ textAlign: 'left' }}>{categoryName}</H2>
              <FormattedRelative value={timestamp}>
                {relative => <AlignedText note>{relative}</AlignedText>}
              </FormattedRelative>
            </MarginView>
          </Col>
        </Row>
        {isAdmin && (
          <Row>
            <Col
              style={{
                paddingBottom: 10,
                paddingLeft: 10
              }}
            >
              <NotificationBadge
                sent={sentNotification}
                received={receivedNotification}
                error={errorNotification}
                showMore
              />
            </Col>
          </Row>
        )}
        <Row>
          <Col>
            <MapView
              style={{ height: 200, flex: 1 }}
              initialRegion={{
                latitude: lat,
                longitude: lon,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421
              }}
              showsMyLocationButton
              showsUserLocation
            >
              <MapView.Marker
                coordinate={{ latitude: lat, longitude: lon }}
                title={displayAddress}
                description={more}
              />
            </MapView>
          </Col>
        </Row>
        <FormattedMessage id="Event.description" defaultMessage="Description">
          {label => <TextFieldRow label={label} value={more} />}
        </FormattedMessage>
        <FormattedMessage id="Event.location" defaultMessage="Location">
          {label => <TextFieldRow label={label} value={displayAddress} />}
        </FormattedMessage>
        {isAssigned && (
          <FormattedMessage id="Event.caller" defaultMessage="Name">
            {label => <TextFieldRow label={label} value={caller} />}
          </FormattedMessage>
        )}
        {isAssigned && (
          <FormattedMessage id="Event.phone" defaultMessage="Phone">
            {label => <TextFieldRow label={label} value={phone} />}
          </FormattedMessage>
        )}
        {isAssigned && (
          <FormattedMessage
            id="Event.privateInfo"
            defaultMessage="Private Info"
          >
            {label => <TextFieldRow label={label} value={privateInfo} />}
          </FormattedMessage>
        )}
        {isAssigned && (
          <FormattedMessage id="Event.carType" defaultMessage="Car type">
            {label => <TextFieldRow label={label} value={carType} />}
          </FormattedMessage>
        )}
        {dispatcher && (
          <FormattedMessage id="Dispatcher.name" defaultMessage="Dispatcher">
            {label => <TextFieldRow label={label} value={dispatcher.name} />}
          </FormattedMessage>
        )}
        {isAssigned &&
          dispatcher && (
            <FormattedMessage
              id="Dispatcher.phone"
              defaultMessage="Dispatcher's Phone"
            >
              {label => (
                <TextFieldRow
                  label={label}
                  value={dispatcher.callCenterPhone}
                />
              )}
            </FormattedMessage>
          )}
        <Row>
          <Col>
            <MarginView>
              <Button
                block
                info
                onPress={() =>
                  Linking.openURL(`https://waze.com/ul?ll=${lat},${lon}`)}
              >
                <Icon name="md-map" />
                <FormattedMessage
                  id="Event.button.navigate"
                  defaultMessage="Navigate with Waze"
                >
                  {txt => <Text>{txt}</Text>}
                </FormattedMessage>
              </Button>
            </MarginView>
          </Col>
        </Row>
        {isAssigned && (
          <Row>
            <Col>
              <MarginView>
                <Button
                  block
                  success
                  onPress={() => Linking.openURL(`tel:${phone}`)}
                >
                  <Icon name="md-call" />
                  <FormattedMessage
                    id="Event.button.callPerson"
                    defaultMessage="Call Person"
                  >
                    {txt => <Text>{txt}</Text>}
                  </FormattedMessage>
                </Button>
              </MarginView>
            </Col>
          </Row>
        )}
        {dispatcher && (
          <Row>
            <Col>
              <MarginView>
                <Button
                  block
                  success
                  onPress={() =>
                    Linking.openURL(`tel:${dispatcher.callCenterPhone}`)}
                >
                  <Icon name="md-call" />
                  <FormattedMessage
                    id="Dispatcher.button.callDispatcher"
                    defaultMessage="Call Dispatcher"
                  >
                    {txt => <Text>{txt}</Text>}
                  </FormattedMessage>
                </Button>
              </MarginView>
            </Col>
          </Row>
        )}
      </Grid>
    </Content>
    <View style={{ height: 70, backgroundColor: '#fff' }}>{children}</View>
  </Container>
)

export default observer(EventDetails)
