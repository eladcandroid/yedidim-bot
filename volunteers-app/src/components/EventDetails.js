import React from 'react'
import styled from 'styled-components/native'
import { observer } from 'mobx-react/native'
import { FormattedMessage, FormattedRelative } from 'react-intl'
import { Image, Linking, StyleSheet, View } from 'react-native'

import {
  Button,
  Container,
  Content,
  Icon,
  Grid,
  Col,
  Row,
  Text,
  Thumbnail
} from 'native-base'
import { MapView } from 'expo'

import NotificationBadge from 'components/NotificationBadge'
import TextFieldRow from './TextFieldRow'
import AlignedText from './AlignedText'

const styles = StyleSheet.create({
  textBold: {
    fontFamily: 'AlefBold',
    marginBottom: 5
  },
  detailsSection: {
    width: '100%',
    borderBottomColor: 'gray',
    borderBottomWidth: 1,
    paddingBottom: 6,
    height: 'auto'
  },
  EventDetailsContainer: {
    marginBottom: 20,
    paddingLeft: 25,
    paddingTop: 15,
    flex: 1,
    flexDirection: 'column'
  },
  noteWithUpperBorder: {
    borderTopColor: 'gray',
    borderTopWidth: 1
  },
  waze: {
    width: 40,
    height: 40,
    borderRadius: 20
  }
})

const MarginView = styled.View`
  margin: 10px 0;
`

const LabelText = styled.Text`
  text-align: left;
  font-family: 'Alef';
  font-size: 16px;
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
    receivedNotification,
    assignedTo
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
              <Text
                style={{
                  textAlign: 'left',
                  borderBottomColor: 'gray',
                  borderBottomWidth: 2,
                  fontWeight: 'bold',
                  fontFamily: 'AlefBold',
                  marginTop: 10
                }}
              >
                {categoryName}
              </Text>
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
        <Row
          style={{
            flex: 1,
            width: '100%',
            marginTop: 10
          }}
        >
          <Col>
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                marginLeft: 7
              }}
            >
              <View>
                <Image
                  style={styles.waze}
                  source={require('../images/waze-logo.png')}
                />
              </View>
              <View>
                <Button
                  style={{
                    height: 30,
                    borderRadius: 20,
                    backgroundColor: '#4285f4',
                    padding: 0,
                    marginLeft: 4,
                    marginTop: 3
                  }}
                  onPress={() =>
                    Linking.openURL(`https://waze.com/ul?ll=${lat},${lon}`)}
                >
                  <FormattedMessage id="Event.button.check.time">
                    {txt => (
                      <Text style={{ fontSize: 14, fontFamily: 'AlefBold' }}>
                        {txt}
                      </Text>
                    )}
                  </FormattedMessage>
                </Button>
              </View>
            </View>
          </Col>
        </Row>
        <View style={styles.EventDetailsContainer}>
          <FormattedMessage id="Event.description">
            {text => <LabelText style={styles.textBold}>{text}</LabelText>}
          </FormattedMessage>
          <LabelText>{displayAddress}</LabelText>
          <LabelText>{carType}</LabelText>
          <LabelText>{more}</LabelText>
        </View>
        {false && (
          <View style={styles.EventDetailsContainer}>
            <View style={styles.detailsSection}>
              <FormattedMessage id="Event.description">
                {text => <LabelText style={styles.textBold}>{text}</LabelText>}
              </FormattedMessage>
              <LabelText>{more}</LabelText>
            </View>
            <View style={[styles.detailsSection, styles.middleSection]}>
              <FormattedMessage id="Event.location">
                {text => <LabelText style={styles.textBold}>{text}</LabelText>}
              </FormattedMessage>
              <LabelText>{displayAddress}</LabelText>
            </View>
            <View style={styles.detailsSection}>
              <FormattedMessage id="Event.carType">
                {text => <LabelText style={styles.textBold}>{text}</LabelText>}
              </FormattedMessage>
            </View>
          </View>
        )}
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
        {assignedTo &&
          !!assignedTo.name && (
            <TextFieldRow label="מתנדב" value={assignedTo.name} />
          )}
        {isAssigned &&
          dispatcher && (
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
        {isAssigned &&
          dispatcher && (
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
