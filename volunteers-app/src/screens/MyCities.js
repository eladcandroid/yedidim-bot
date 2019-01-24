import React, { Component } from 'react'
import { FormattedMessage, FormattedRelative } from 'react-intl'
import {
  I18nManager,
  Linking,
  Image,
  View,
  ActivityIndicator
} from 'react-native'
import { trackEvent } from 'io/analytics'
import StartachLogo from 'images/startach-logo.jpg'

import {
  Button,
  Body,
  Header,
  Title,
  Left,
  Icon,
  Right,
  Container,
  Content,
  Text,
  Grid,
  Col,
  Row,
  List,
  ListItem
} from 'native-base'
import { NavigationActions } from 'react-navigation'
import { inject, observer } from 'mobx-react/native'
import appStyles, { AppText } from '../global-styles'

import AlignedText from 'components/AlignedText'
import styled from 'styled-components/native'

const LabelText = styled.Text`
  text-align: left;
  font-family: 'Alef';
  font-size: 18px;
  margin: 20px;
  text-align: center;
`

const ListItemContainer = styled.View`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  background-color: white;
  border-bottom-width: 1;
  border-bottom-color: lightgray;
  margin-top: 10;
  margin-bottom: 0;
  padding: 15px 15px;
`
const zeroStateText = 'קבלת התראות מישובים קבועים, גם כשאינך בקרבת מקום'

const LocationItem = observer(
  ({
    onPress,
    location: { id, name, lat, lon, isLoading },
    onDeleteLocation
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
      <ListItem avatar>
        <ListItemContainer>
          <AppText style={{ fontWeight: 'bold', fontSize: 18 }}>{name}</AppText>
          <Button transparent onPress={onDeleteLocation}>
            <Icon style={{ color: 'black' }} name="trash" />
          </Button>
        </ListItemContainer>
      </ListItem>
    )
)

@observer
class MyCities extends Component {
  static navigationOptions = ({ navigation }) => ({
    header: (
      <Header style={appStyles.navigationHeaderStyles}>
        <Left>
          <Button
            transparent
            onPress={() => {
              trackEvent('Navigation', { page: 'BackFromMyCities' })
              navigation.goBack()
            }}
          >
            <Icon
              style={appStyles.headerTitle}
              name={I18nManager.isRTL ? 'arrow-forward' : 'arrow-back'}
            />
          </Button>
        </Left>
        <Body>
          <FormattedMessage
            id="About.MyCities.title"
            defaultMessage="הישובים שלי"
          >
            {txt => (
              <Title style={[appStyles.appFont, appStyles.headerTitle]}>
                {txt}
              </Title>
            )}
          </FormattedMessage>
        </Body>
        <Right />
      </Header>
    )
  })

  render() {
    const userLocations = this.props.currentUser.locations;
    return (
      <Container>
        <Content style={{ flex: 1, backgroundColor: '#fff' }}>
          <View style={{ alignItems: 'center', marginTop: 30 }}>
            {userLocations.length === 0 && (
              <LabelText>{zeroStateText}</LabelText>
            )}
            {userLocations.slice(0, 3).map(location => (
              <LocationItem
                location={location}
                currentUser={this.props.currentUser}
                onDeleteLocation={() => {
                  this.props.currentUser.removeLocation(location)
                }}
              />
            ))}
          </View>
          {userLocations.length < 3 ? (
            <Button
              block
              large
              style={{
                borderRadius: 0,
                flex: 1,
                height: 40,
                marginLeft: '25%',
                marginRight: '25%',
                marginTop: 10
              }}
              onPress={() => {
                this.props.navigation.dispatch(
                  NavigationActions.navigate({
                    routeName: 'AddCity'
                  })
                )
              }}
            >
              <FormattedMessage id="Locations.add">
                {txt => <Text>{txt}</Text>}
              </FormattedMessage>
            </Button>
          ) : (
            <Text style={{ textAlign: 'center', marginTop: 10 }}>
              ניתן להוסיף עד שלושה ישובים
            </Text>
          )}
        </Content>
      </Container>
    )
  }
}

export default inject(({ stores }) => ({
  currentUser: stores.authStore.currentUser
}))(MyCities)
