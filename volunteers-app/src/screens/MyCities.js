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
import debounce from 'lodash.debounce'
import styled from 'styled-components/native'

const LabelText = styled.Text`
  text-align: left;
  font-family: 'Alef';
  font-size: 16px;
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
  ({ onPress, location: { id, name, lat, lon, isLoading } }) =>
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
          onPress(location)
        }}
      >
        <ListItemContainer>
          <AppText style={{ fontWeight: 'bold', fontSize: 18 }}>{name}</AppText>
          <Icon
            style={{ color: 'black' }}
            name={I18nManager.isRTL ? 'arrow-back' : 'arrow-forward'}
          />
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

  handleLocationItemPress = debounce(
    location => {
      trackEvent('Navigation', { page: 'EditCity', location })
      this.props.navigation.navigate('EditCity', { location })
    },
    1000,
    { leading: true, trailing: false }
  )

  render() {
    return (
      <Container>
        <Content style={{ flex: 1, backgroundColor: '#fff' }}>
          <View style={{ alignItems: 'center', marginTop: 30 }}>
            <LabelText>{zeroStateText}</LabelText>
            {this.props.currentUser.locations.map(location => {
              console.log('!!!!!', location)
              return (
                <LocationItem
                  location={location}
                  onPress={this.handleLocationItemPress}
                />
              )
            })}
          </View>
          <Button
            style={{ width: 100, height: 20 }}
            onPress={() => {
              this.props.navigation.dispatch(
                NavigationActions.navigate({
                  routeName: 'AddCity'
                })
              )
            }}
          >
            <FormattedMessage
              id="About.AddCity.title"
              defaultMessage="Add City"
            >
              {txt => <AppText>{txt}</AppText>}
            </FormattedMessage>
          </Button>
        </Content>
      </Container>
    )
  }
}

export default inject(({ stores }) => ({
  currentUser: stores.authStore.currentUser
}))(MyCities)
