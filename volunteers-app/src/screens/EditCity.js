import React, { Component } from 'react'
import styled from 'styled-components/native'
import { FormattedMessage } from 'react-intl'
import { I18nManager, Linking, Image, View } from 'react-native'
import { trackEvent } from 'io/analytics'
import AlignedText from 'components/AlignedText'

import {
  Button,
  Body,
  Header,
  Title,
  Left,
  Icon,
  Label,
  Right,
  Container,
  Content,
  Text,
  Grid,
  Col,
  Row
} from 'native-base'
import { inject, observer } from 'mobx-react/native'
import { NavigationActions } from 'react-navigation'

const MarginView = styled.View`
  margin: 10px 10px;
`
@observer
class EditCity extends Component {
  constructor(props) {
    super(props)
  }
  static navigationOptions = ({ navigation }) => ({
    header: (
      <Header>
        <Left>
          <Button
            transparent
            onPress={() => {
              trackEvent('Navigation', { page: 'BackFromEditCity' })
              navigation.goBack()
            }}
          >
            <Icon name={I18nManager.isRTL ? 'arrow-forward' : 'arrow-back'} />
          </Button>
        </Left>
        <Body>
          <FormattedMessage
            id="About.EditCity.title"
            defaultMessage="עריכת ישוב"
          >
            {txt => <Title>{txt}</Title>}
          </FormattedMessage>
        </Body>
        <Right />
      </Header>
    )
  })

  render() {
    console.log(this.props)
    return (
      <Container>
        <Content style={{ flex: 1, backgroundColor: '#fff', paddingTop: 30 }}>
          <AlignedText>כתובת:</AlignedText>
          <AlignedText>{this.props.location.name}</AlignedText>
        </Content>
        <View
          style={{
            position: 'absolute',
            bottom: 50,
            width: '100%'
          }}
        >
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
              this.props.currentUser.deleteLocation({
                id: this.props.location.id,
                name: this.props.location.name,
                lat: this.props.location.lat,
                lon: this.props.location.lon
              })
              this.props.navigation.goBack()
            }}
          >
            <FormattedMessage id="Locations.remove.confirm">
              {txt => <Text>{txt}</Text>}
            </FormattedMessage>
          </Button>
        </View>
      </Container>
    )
  }
}

export default inject(({ stores }) => ({
  currentUser: stores.authStore.currentUser
}))(EditCity)
