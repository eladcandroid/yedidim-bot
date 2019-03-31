import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { I18nManager, View, ActivityIndicator } from 'react-native'
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
  ListItem,
  Radio
} from 'native-base'
import { NavigationActions } from 'react-navigation'
import { inject, observer } from 'mobx-react/native'
import styled from 'styled-components/native'

import AlignedText from '../components/AlignedText'
import { trackEvent } from '../io/analytics'
import appStyles, { AppText } from '../global-styles'

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
class Settings extends Component {
  static navigationOptions = ({ navigation }) => ({
    header: (
      <Header style={appStyles.navigationHeaderStyles}>
        <Left>
          <Button
            transparent
            onPress={() => {
              trackEvent('Navigation', { page: 'BackFromSettings' })
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
            id="About.Settings.title"
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
    const userLocations = this.props.currentUser.locations
    const availableRadiusValues = [
      { label: '1 ק״מ', value: 1 },
      { label: '3 ק״מ', value: 3 },
      { label: '5 ק״מ', value: 5 }
    ]
    return (
      <Container>
        <Content style={{ flex: 1, backgroundColor: '#fff' }}>
          <View style={{ alignItems: 'center', marginTop: 30 }}>
            <Title>הישובים שלי</Title>
            {userLocations.length === 0 && (
              <LabelText>{zeroStateText}</LabelText>
            )}
            {userLocations.slice(0, 3).map(location => (
              <LocationItem
                key={location.id}
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

          <Title
            style={{
              marginTop: 50
            }}
          >
            רדיוס לקבלת התראות
          </Title>
          {availableRadiusValues.map(data => (
            <ListItem
              key={data.value}
              onPress={() => {
                this.props.currentUser.setRadius(data.value)
              }}
            >
              <Left>
                <Text>{data.label}</Text>
              </Left>
              <Right>
                <Radio
                  selected={this.props.currentUser.radius === data.value}
                />
              </Right>
            </ListItem>
          ))}
        </Content>
      </Container>
    )
  }
}

export default inject(({ stores }) => ({
  currentUser: stores.authStore.currentUser
}))(Settings)
