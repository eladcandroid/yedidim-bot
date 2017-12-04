import React, { Component } from 'react'
import styled from 'styled-components/native'
import { FormattedMessage, defineMessages } from 'react-intl'
import { I18nManager, View } from 'react-native'
import { inject, observer } from 'mobx-react/native'
import { NavigationActions } from 'react-navigation'

import {
  Button,
  Body,
  Header,
  Title,
  Left,
  Icon,
  Right,
  Text,
  Container,
  Content,
  Grid,
  Col,
  Row,
  Item,
  Input,
  Toast
} from 'native-base'

import AlignedText from '../components/AlignedText'

const MarginView = styled.View`
  margin: 10px 10px;
`

const toastMsgs = {
  finalise: defineMessages({
    text: {
      id: 'Feedback.toast.finalise.text',
      defaultMessage: 'Event was finalised'
    },
    buttonText: {
      id: 'Feedback.toast.finalise.buttonText',
      defaultMessage: 'OK'
    }
  }),
  unaccept: defineMessages({
    text: {
      id: 'Feedback.toast.unaccept.text',
      defaultMessage: 'Event was cancelled'
    },
    buttonText: {
      id: 'Feedback.toast.unaccept.buttonText',
      defaultMessage: 'OK'
    }
  })
}

@observer
export class FeedbackScreen extends Component {
  static navigationOptions = ({ navigation }) => ({
    header: (
      <Header>
        <Left>
          <Button transparent onPress={() => navigation.goBack()}>
            <Icon name={I18nManager.isRTL ? 'arrow-forward' : 'arrow-back'} />
          </Button>
        </Left>
        <Body>
          <FormattedMessage id="Feedback.title" defaultMessage="Feedback">
            {txt => <Title>{txt}</Title>}
          </FormattedMessage>
        </Body>
        <Right />
      </Header>
    )
  })

  state = {
    feedback: ''
  }

  onFeedbackChange = feedback => {
    this.setState({ feedback })
  }

  onActionBtnPress = async () => {
    const { event, navigation, removeEvent, screenProps: { intl } } = this.props
    const { state: { params: { action, eventId } } } = navigation

    // Execute action on event
    await event[action](this.state.feedback)
    // Remove event from list of events
    await removeEvent(eventId)
    // Navigate to home (resetting state)
    navigation.dispatch(
      NavigationActions.reset({
        index: 0,
        actions: [NavigationActions.navigate({ routeName: 'Home' })]
      })
    )
    // Show toast
    Toast.show({
      text: intl.formatMessage(toastMsgs[action].text),
      position: 'bottom',
      type: action === 'finalise' ? 'success' : 'danger',
      buttonText: intl.formatMessage(toastMsgs[action].buttonText),
      duration: 5000
    })
  }

  render() {
    const { name, navigation: { state: { params: { action } } } } = this.props
    const { feedback } = this.state
    const finaliseFeedback = action === 'finalise'

    return (
      <Container>
        <Content style={{ flex: 1, backgroundColor: '#fff' }}>
          <Grid>
            <Row>
              <Col>
                <MarginView>
                  <FormattedMessage
                    id="Feedback.description"
                    defaultMessage="{name}, thank you for taking care of the event."
                    values={{
                      name
                    }}
                  >
                    {txt => <AlignedText>{txt}</AlignedText>}
                  </FormattedMessage>
                </MarginView>
              </Col>
            </Row>
            <Row>
              <Col>
                <MarginView>
                  {finaliseFeedback ? (
                    <FormattedMessage
                      id="Feedback.action.finalise"
                      defaultMessage="Please write down a short feedback about the event before finalising it."
                    >
                      {txt => <AlignedText>{txt}</AlignedText>}
                    </FormattedMessage>
                  ) : (
                    <FormattedMessage
                      id="Feedback.action.cancel"
                      defaultMessage="Please write down a short feedback about the event and why you decided to cancel it."
                    >
                      {txt => <AlignedText>{txt}</AlignedText>}
                    </FormattedMessage>
                  )}
                </MarginView>
              </Col>
            </Row>
            <Row>
              <Col>
                <MarginView>
                  <Item regular>
                    <FormattedMessage
                      id="Feedback.input"
                      defaultMessage="Enter your feedback (required)"
                    >
                      {txt => (
                        <Input
                          multiline
                          numberOfLines={20}
                          style={{ height: 200 }}
                          placeholder={txt}
                          value={feedback}
                          onChangeText={this.onFeedbackChange}
                        />
                      )}
                    </FormattedMessage>
                  </Item>
                </MarginView>
              </Col>
            </Row>
          </Grid>
        </Content>
        <View style={{ height: 70, backgroundColor: '#fff' }}>
          <Grid>
            <Row style={{ marginTop: 10 }}>
              <Col>
                <Button
                  full
                  large
                  block
                  success={finaliseFeedback}
                  danger={!finaliseFeedback}
                  disabled={!feedback}
                  onPress={this.onActionBtnPress}
                >
                  {finaliseFeedback ? (
                    <FormattedMessage
                      id="Feedback.button.finalise"
                      defaultMessage="Finalise Event & Send"
                    >
                      {txt => <Text>{txt}</Text>}
                    </FormattedMessage>
                  ) : (
                    <FormattedMessage
                      id="Feedback.button.cancel"
                      defaultMessage="Cancel Event & Send"
                    >
                      {txt => <Text>{txt}</Text>}
                    </FormattedMessage>
                  )}
                  <Icon name="md-checkmark-circle" />
                </Button>
              </Col>
            </Row>
          </Grid>
        </View>
      </Container>
    )
  }
}

export default inject(
  ({ stores }, { navigation: { state: { params: { eventId } } } }) => ({
    event: stores.eventStore.findById(eventId),
    removeEvent: stores.eventStore.removeEvent,
    name: stores.authStore.currentUser.name
  })
)(FeedbackScreen)
