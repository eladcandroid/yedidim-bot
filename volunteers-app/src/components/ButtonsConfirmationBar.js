import React, { Component } from 'react'
import { FormattedMessage, injectIntl } from 'react-intl'
import { Alert, StyleSheet } from 'react-native'

import { Button, Icon, Grid, Col, Row, Text } from 'native-base'

const styles = StyleSheet.create({
  btn: {
    borderRadius: 10,
    marginHorizontal: 15,
    flex: 1,
    paddingHorizontal: 20,
    height: 35
  },
  accept: {
    backgroundColor: 'green'
  },
  cancel: {
    backgroundColor: 'red'
  },
  footer: {
    marginBottom: 20,
    marginTop: 10,
    width: '100%',
    flex: 1,
    justifyContent: 'space-between'
  },
  personIcon: {
    fontSize: 20,
    marginRight: 20,
    marginLeft: 20,
    textAlign: 'left'
  },
  logo: {
    width: '100%',
    height: 250,
    marginTop: 20
  }
})
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
        <Row style={styles.footer}>
          <Col>
            <Button block large
              style={[styles.btn, styles.accept]}
              onPress={this.handleOkClick}
            >
              <FormattedMessage {...ok.modalMsgs.buttonMsgs}>
                {txt => <Text>{txt}</Text>}
              </FormattedMessage>
            </Button>
          </Col>
          <Col>
            <Button block large
              style={[styles.btn, styles.cancel]}
              onPress={this.handleCancelClick}
            >
              <FormattedMessage {...cancel.modalMsgs.buttonMsgs}>
                {txt => <Text>{txt}</Text>}
              </FormattedMessage>
            </Button>
          </Col>
        </Row>
      </Grid>
    )
  }
}

export default injectIntl(ButtonsConfirmationBar)
