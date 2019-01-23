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

const MarginView = styled.View`
  margin: 10px 10px;
`
class AddCity extends Component {
  static navigationOptions = ({ navigation }) => ({
    header: (
      <Header>
        <Left>
          <Button
            transparent
            onPress={() => {
              trackEvent('Navigation', { page: 'BackFromAddCity' })
              navigation.goBack()
            }}
          >
            <Icon name={I18nManager.isRTL ? 'arrow-forward' : 'arrow-back'} />
          </Button>
        </Left>
        <Body>
        <FormattedMessage id="About.AddCity.title" defaultMessage="הוספת ישוב">
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


        </Content>
      </Container>
    )
  }
}

export default AddCity
