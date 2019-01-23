import React, { Component } from 'react'
import styled from 'styled-components/native'
import { FormattedMessage } from 'react-intl'
import { I18nManager, Linking, Image, View } from 'react-native'
import { trackEvent } from 'io/analytics'
import StartachLogo from 'images/startach-logo.jpg'
import AlignedText from 'components/AlignedText'

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
const zeroStateText = 'קבלת התראות מישובים קבועים, גם כשאינך בקרבת מקום';

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
        <FormattedMessage id="About.MyCities.title" defaultMessage="הישובים שלי">
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
          <AlignedText>{zeroStateText}</AlignedText>
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
          </Button>

        </Content>
      </Container>
    )
  }
}

export default MyCities
