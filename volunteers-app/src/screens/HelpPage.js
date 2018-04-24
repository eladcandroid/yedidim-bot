import React, { Component } from 'react'
import styled from 'styled-components/native'
import { FormattedMessage } from 'react-intl'
import { I18nManager, Linking, Image } from 'react-native'
import { trackEvent } from 'io/analytics'

import {
  Button, Body, Header, Title, Left, Icon, Right, Container, Content, Text, Grid, Col, Row
} from 'native-base'

import {sendTestNotification} from '../io/notificationsTester'
import {inject, observer} from "mobx-react/native";

const MarginView = styled.View`
  margin: 10px 10px;
`

@observer
class HelpPage extends Component {
  static navigationOptions = ({navigation}) => ({
    header: (
      <Header>
        <Left>
          <Button
            transparent
            onPress={() => {
              trackEvent('Navigation', {page: 'BackFromHelpPage'})
              navigation.goBack()
            }}
          >
            <Icon name={I18nManager.isRTL ? 'arrow-forward' : 'arrow-back'}/>
          </Button>
        </Left>
        <Body>
        <FormattedMessage id="HelpPage.title" defaultMessage="Help">
          {txt => <Title>{txt}</Title>}
        </FormattedMessage>
        </Body>
        <Right/>
      </Header>
    )
  })

  render() {
    const userId = this.props.currentUser.id;
    return (
      <Container>
        <Content style={{ flex: 1, backgroundColor: '#fff' }}>
          <Grid>
            <Row>
              <Col>
                <MarginView>
                  <Button
                    full
                    block
                    onPress={() => sendTestNotification(userId)}
                  >
                    <FormattedMessage
                      id="helpPage.notificationTestBtn.text"
                      defaultMessage="בדוק התראות"
                    >
                      {txt => <Text>{txt}</Text>}
                    </FormattedMessage>
                  </Button>
                </MarginView>
              </Col>
            </Row>
          </Grid>
        </Content>
      </Container>
    )
  }
}

export default inject(({ stores }) => ({
  currentUser: stores.authStore.currentUser
}))(HelpPage)