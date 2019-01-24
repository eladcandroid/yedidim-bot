import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { I18nManager, Linking, Image, View } from 'react-native'
import { trackEvent } from 'io/analytics'
import styled from 'styled-components/native'
import { inject, observer } from 'mobx-react/native'

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
  Row
} from 'native-base'
import { NavigationActions } from 'react-navigation'
import { ListItem } from './SideBar'

const MarginView = styled.View`
  margin: 10px 10px;
`
const LabelText = styled.Text`
  text-align: center;
  font-family: 'Alef';
  font-size: 18px;
  margin: 10%;
`
const zeroStateText = 'קבלת התראות מישובים קבועים, גם כשאינך בקרבת מקום'

@observer
class MyCities extends Component {
  static navigationOptions = ({ navigation }) => ({
    header: (
      <Header>
        <Left>
          <Button
            transparent
            onPress={() => {
              trackEvent('Navigation', { page: 'BackFromMyCities' })
              navigation.goBack()
            }}
          >
            <Icon name={I18nManager.isRTL ? 'arrow-forward' : 'arrow-back'} />
          </Button>
        </Left>
        <Body>
          <FormattedMessage
            id="About.MyCities.title"
            defaultMessage="הישובים שלי"
          >
            {txt => <Title>{txt}</Title>}
          </FormattedMessage>
        </Body>
        <Right />
      </Header>
    )
  })

  render() {
    return (
      <Container>
        <Content style={{ flex: 1, backgroundColor: '#fff' }}>
          <View style={{ alignItems: 'center', marginTop: 30 }}>
            <LabelText>{zeroStateText}</LabelText>
            {this.props.currentUser.locations.map(location => {
              console.log('!!!!!', location)
            })}
          </View>

          <Button
            block
            large
            style={{
              borderRadius: 0,
              flex: 1,
              height: 40,
              marginLeft: '25%',
              marginRight: '25%'
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
        </Content>
      </Container>
    )
  }
}

export default inject(({ stores }) => ({
  currentUser: stores.authStore.currentUser
}))(MyCities)
