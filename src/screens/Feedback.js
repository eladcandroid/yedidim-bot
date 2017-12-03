import React, { Component } from 'react'
import styled from 'styled-components/native'
import { FormattedMessage, defineMessages } from 'react-intl'
import { I18nManager, View } from 'react-native'

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
  Input
} from 'native-base'

import AlignedText from '../components/AlignedText'

const MarginView = styled.View`
  margin: 10px 10px;
`

export class Feedback extends Component {
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

  render() {
    const { feedback } = this.state

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
                      name: 'Alan Rubin'
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
                  <FormattedMessage
                    id="Feedback.action"
                    defaultMessage="Please write down a short feedback about the event before finalising it."
                  >
                    {txt => <AlignedText>{txt}</AlignedText>}
                  </FormattedMessage>
                </MarginView>
              </Col>
            </Row>
            <Row>
              <Col>
                <MarginView>
                  <Item regular>
                    <FormattedMessage
                      id="Feedback.input"
                      defaultMessage="Enter your feedback"
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
                <Button full large block success disabled={!feedback}>
                  <FormattedMessage
                    id="Feedback.button"
                    defaultMessage="Confirm & Send"
                  >
                    {txt => <Text>{txt}</Text>}
                  </FormattedMessage>
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

export default Feedback
