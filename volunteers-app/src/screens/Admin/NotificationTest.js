import React, { Component } from 'react'
import styled from 'styled-components/native'
import { FormattedMessage } from 'react-intl'
import { I18nManager, SectionList } from 'react-native'
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
  Row,
  Separator
} from 'native-base'

import { inject, observer, Observer } from 'mobx-react/native'
import { sendTestNotification } from 'io/notifications'

import AlignedText from 'components/AlignedText'

import UserListItem from './UserListItem'

const MarginView = styled.View`
  margin: 10px 10px;
`

@observer
class NotificationTest extends Component {
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

  componentDidMount = () => {
    this.props.init()
  }

  componentWillUnmount = () => {
    this.props.finish()
  }

  render() {
    const { volunteers, dispatchers, admins } = this.props

    return (
      <Container>
        <Content style={{ flex: 1, backgroundColor: '#fff' }}>
          <Grid>
            <Row>
              <Col>
                <MarginView>
                  <Button full block onPress={() => sendTestNotification()}>
                    <FormattedMessage
                      id="NotificationReport.button.text"
                      defaultMessage="Retest Notifications for everyone"
                    >
                      {txt => <AlignedText>{txt}</AlignedText>}
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
                <SectionList
                  renderItem={({ item }) => (
                    <Observer>
                      {() => <UserListItem key={item.id} {...item} />}
                    </Observer>
                  )}
                  renderSectionHeader={({ section: { title } }) => (
                    <Separator bordered>
                      <AlignedText>{title}</AlignedText>
                    </Separator>
                  )}
                  sections={[
                    {
                      title: 'מתנדבים',
                      data: volunteers
                    },
                    {
                      title: 'מוקדנים',
                      data: dispatchers
                    },
                    {
                      title: 'מנהלים',
                      data: admins
                    }
                  ]}
                  keyExtractor={item => item.id}
                />
              </Col>
            </Row>
          </Grid>
        </Content>
      </Container>
    )
  }
}

export default inject(({ stores }) => ({
  init: stores.userStore.init,
  finish: stores.userStore.finish,
  admins: stores.userStore.admins,
  dispatchers: stores.userStore.dispatchers,
  volunteers: stores.userStore.volunteers
}))(observer(NotificationTest))
