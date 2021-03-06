import React, { Component } from 'react'
import appStyles from '../global-styles'
import styled from 'styled-components/native'
import { FormattedMessage } from 'react-intl'
import { I18nManager, Linking, Image } from 'react-native'
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

class AboutStartach extends Component {
  static navigationOptions = ({ navigation }) => ({
    header: (
      <Header style={appStyles.navigationHeaderStyles}>
        <Left>
          <Button
            transparent
            onPress={() => {
              trackEvent('Navigation', { page: 'BackFromAboutStartach' })
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
          <FormattedMessage id="About.Startach.title" defaultMessage="Startach">
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
    return (
      <Container>
        <Content style={{ flex: 1, backgroundColor: '#fff' }}>
          <Grid>
            <Row>
              <Col>
                <MarginView>
                  <Image
                    source={StartachLogo}
                    style={{
                      height: 250,
                      width: '100%',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                    resizeMode="cover"
                  />
                </MarginView>
                <MarginView>
                  <FormattedMessage
                    id="About.Startach.p1"
                    defaultMessage="Startach is a social initiative aimed at developing technological solutions to contribute to and assist different audiences in Israeli society."
                  >
                    {txt => <AlignedText>{txt}</AlignedText>}
                  </FormattedMessage>
                </MarginView>
                <MarginView>
                  <FormattedMessage
                    id="About.Startach.p2"
                    defaultMessage="Startach brings together people with social and environmental awareness, caring and goodwill, and mobilizes them to create solutions for improving reality and the world."
                  >
                    {txt => <AlignedText>{txt}</AlignedText>}
                  </FormattedMessage>
                </MarginView>
                <MarginView>
                  <FormattedMessage
                    id="About.Startach.p3"
                    defaultMessage="We are in constant search for great ideas and great people. Want to join? Get in touch with us!"
                  >
                    {txt => <AlignedText>{txt}</AlignedText>}
                  </FormattedMessage>
                </MarginView>
                <MarginView>
                  <Button
                    full
                    block
                    onPress={() =>
                      Linking.openURL('https://www.facebook.com/StartAchCom/')}
                  >
                    <FormattedMessage
                      id="About.Startach.facebook"
                      defaultMessage="Visit our Facebook page"
                    >
                      {txt => <Text>{txt}</Text>}
                    </FormattedMessage>
                    <Icon name="logo-facebook" />
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

export default AboutStartach
