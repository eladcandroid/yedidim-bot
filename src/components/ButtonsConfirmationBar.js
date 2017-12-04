import React, { Component } from 'react'
import { FormattedMessage, injectIntl } from 'react-intl'
import { Alert } from 'react-native'

import { Button, Icon, Grid, Col, Row, Text } from 'native-base'

class ButtonsConfirmationBar extends Component {
  handleClick = type => {
    const { intl } = this.props
    const { onPress, modalMsgs } = this.props[type]

    Alert.alert(
      intl.formatMessage(modalMsgs.title),
      intl.formatMessage(modalMsgs.text),
      [
        {
          text: intl.formatMessage(modalMsgs.confirm),
          onPress
        },
        {
          text: intl.formatMessage(modalMsgs.cancel),
          style: 'cancel'
        }
      ],
      { cancelable: false }
    )
  }

  handleOkClick = () => {
    this.handleClick('ok')
  }

  handleCancelClick = () => {
    this.handleClick('cancel')
  }

  render() {
    const { ok, cancel } = this.props

    return (
      <Grid>
        <Row style={{ marginTop: 10 }}>
          <Col>
            <Button full large block success onPress={this.handleOkClick}>
              <FormattedMessage {...ok.buttonMsgs}>
                {txt => <Text>{txt}</Text>}
              </FormattedMessage>
              <Icon name="md-checkmark-circle" />
            </Button>
          </Col>
          <Col>
            <Button full large block danger onPress={this.handleCancelClick}>
              <FormattedMessage {...cancel.buttonMsgs}>
                {txt => <Text>{txt}</Text>}
              </FormattedMessage>
              <Icon name="md-close-circle" />
            </Button>
          </Col>
        </Row>
      </Grid>
    )
  }
}

export default injectIntl(ButtonsConfirmationBar)
