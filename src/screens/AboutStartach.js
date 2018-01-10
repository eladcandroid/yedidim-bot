import React, { Component } from 'react'
import styled from 'styled-components/native'
import { FormattedMessage } from 'react-intl'
import { I18nManager } from 'react-native'
import { trackEvent } from 'io/analytics'

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
  Grid,
  Col,
  Row
} from 'native-base'

import AlignedText from '../components/AlignedText'

const MarginView = styled.View`
  margin: 10px 10px;
`

class AboutStartach extends Component {
  static navigationOptions = ({ navigation }) => ({
    header: (
      <Header>
        <Left>
          <Button
            transparent
            onPress={() => {
              trackEvent('Navigation', { page: 'BackFromAboutStartach' })
              navigation.goBack()
            }}
          >
            <Icon name={I18nManager.isRTL ? 'arrow-forward' : 'arrow-back'} />
          </Button>
        </Left>
        <Body>
          <FormattedMessage
            id="About.Startach.title"
            defaultMessage="About Startach"
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
          <Grid>
            <Row>
              <Col>
                <MarginView>
                  <FormattedMessage
                    id="About.Startach.description"
                    defaultMessage="Startach is a social initiative aimed at developing technological solutions to contribute to and assist different audiences in Israeli society. Start-up brings together people with social and environmental awareness, caring and goodwill, and mobilizes them to create solutions for improving reality and the world. We are in constant search for great ideas and great people. Want to join? Get in touch with us!"
                  >
                    {txt => <AlignedText>{txt}</AlignedText>}
                  </FormattedMessage>
                </MarginView>
              </Col>
            </Row>
          </Grid>
        </Content>
      </Container>
    )
  }
}

export default AboutStartach
