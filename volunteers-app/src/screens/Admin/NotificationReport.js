import React, { Component } from 'react'
import styled from 'styled-components/native'
import { FormattedMessage, FormattedRelative } from 'react-intl'
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
  Text,
  Grid,
  Col,
  Row,
  List,
  ListItem,
  Separator,
  ActionSheet
} from 'native-base'

import { inject, observer } from 'mobx-react/native'
import { sendTestNotification } from 'io/notificationsTester'

// import AlignedText from 'components/AlignedText'

const MarginView = styled.View`
  margin: 10px 10px 0;
`

const ListMargin = styled(List)`
  margin: 10px 0;
`

@observer
class NotificationReport extends Component {
  static navigationOptions = ({ navigation }) => ({
    header: (
      <Header>
        <Left>
          <Button
            transparent
            onPress={() => {
              trackEvent('Navigation', { page: 'BackFromHelpPage' })
              navigation.goBack()
            }}
          >
            <Icon name={I18nManager.isRTL ? 'arrow-forward' : 'arrow-back'} />
          </Button>
        </Left>
        <Body>
          <FormattedMessage
            id="NotificationReport.title"
            defaultMessage="Notifications"
          >
            {txt => <Title>{txt}</Title>}
          </FormattedMessage>
        </Body>
        <Right />
      </Header>
    )
  })

  render() {
    const userId = this.props.currentUser.id
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
                      id="NotificationReport.button.text"
                      defaultMessage="Reset & Send test notifications to all"
                    >
                      {txt => <Text>{txt}</Text>}
                    </FormattedMessage>
                  </Button>
                </MarginView>
                {/* <MarginView>
                  <FormattedMessage
                    id="NotificationReport.text"
                    defaultMessage="Last test done at:"
                  >
                    {txt => (
                      <FormattedRelative value={new Date().getTime()}>
                        {relative => (
                          <AlignedText>
                            {txt} {relative}
                          </AlignedText>
                        )}
                      </FormattedRelative>
                    )}
                  </FormattedMessage>
                </MarginView> */}
              </Col>
            </Row>
            <Row>
              <Col>
                <ListMargin>
                  <Separator bordered>
                    <FormattedMessage
                      id="NotificationReport.volunteers"
                      defaultMessage="Volunteers"
                    >
                      {txt => <Text>{txt}</Text>}
                    </FormattedMessage>
                  </Separator>
                  <ListItem
                    icon
                    onPress={() =>
                      ActionSheet.show(
                        {
                          options: ['Call', 'Resend Notification', 'Cancel'],
                          cancelButtonIndex: 2,
                          title: 'Aaron Bennet Actions'
                        },
                        buttonIndex => {
                          console.log(
                            ['Call', 'Resend Notification', 'Delete', 'Cancel'][
                              buttonIndex
                            ]
                          )
                        }
                      )}
                  >
                    <Body>
                      <Text>Aaron Bennet</Text>
                    </Body>
                    <Right>
                      <Text note style={{ color: 'green' }}>
                        Received now
                      </Text>
                      <Icon
                        warning
                        name="ios-checkmark-circle"
                        style={{ color: 'green' }}
                      />
                    </Right>
                  </ListItem>
                  <ListItem icon>
                    <Body>
                      <Text>Aaron Bennet</Text>
                    </Body>
                    <Right>
                      <FormattedMessage
                        id="NotificationReport.status.sent"
                        defaultMessage="Waiting"
                      >
                        {txt => (
                          <FormattedRelative
                            value={new Date().getTime() - 232223222}
                          >
                            {relative => (
                              <Text note style={{ color: 'orange' }}>
                                {txt} ({relative})
                              </Text>
                            )}
                          </FormattedRelative>
                        )}
                      </FormattedMessage>
                      <Icon name="ios-time" style={{ color: 'orange' }} />
                    </Right>
                  </ListItem>
                  <ListItem icon last>
                    <Body>
                      <Text>Aaron Bennet</Text>
                    </Body>
                    <Right>
                      <Text note style={{ color: 'orange' }}>
                        Waiting (3 days ago)
                      </Text>
                      <Icon name="ios-time" style={{ color: 'orange' }} />
                    </Right>
                  </ListItem>
                  <Separator bordered>
                    <FormattedMessage
                      id="NotificationReport.dispatchers"
                      defaultMessage="Dispatchers"
                    >
                      {txt => <Text>{txt}</Text>}
                    </FormattedMessage>
                  </Separator>
                  <ListItem icon>
                    <Body>
                      <Text>Aaron Bennet</Text>
                    </Body>
                    <Right>
                      <Text note style={{ color: 'red' }}>
                        No Token (1 hour ago)
                      </Text>
                      <Icon name="ios-alert" style={{ color: 'red' }} />
                    </Right>
                  </ListItem>
                  <ListItem icon>
                    <Body>
                      <Text>Aaron Bennet</Text>
                    </Body>
                    <Right>
                      <Text note style={{ color: 'red' }}>
                        Server Error (just now)
                      </Text>
                      <Icon name="ios-alert" style={{ color: 'red' }} />
                    </Right>
                  </ListItem>
                </ListMargin>
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
}))(NotificationReport)
