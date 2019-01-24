import React, { Component } from 'react'
import { FormattedMessage, injectIntl } from 'react-intl'
import { Alert, StyleSheet, View } from 'react-native'

import { Button, Icon, Grid, Col, Row, Text } from 'native-base'
import styled from 'styled-components/native'

const styles = StyleSheet.create({
  btn: {
    borderRadius: 10,
    marginHorizontal: 10,
    flex: 1,
    paddingHorizontal: 20,
    height: '100%',
    textAlign: 'center',
    paddingBottom: 6
  },
  accept: {
    backgroundColor: '#63db63'
  },
  footer: {
    marginBottom: 20,
    marginTop: 10,
    width: '100%',
    flex: 1,
    justifyContent: 'space-between',
    height: '100%'
  },
  logo: {
    width: '100%',
    height: 250,
    marginTop: 20
  },
  font: {
    fontFamily: 'AlefBold',
    textAlign: 'center',
    fontSize: 21,
    marginTop: 10
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
    const { ok } = this.props

    return (
      <View style={styles.footer}>
        <Button
          block
          style={[styles.btn, styles.accept]}
          onPress={this.handleOkClick}
        >
          <FormattedMessage {...ok.modalMsgs.buttonMsgs}>
            {txt => <Text style={styles.font}>{txt}</Text>}
          </FormattedMessage>
        </Button>
      </View>
    )
  }
}

export default injectIntl(ButtonsConfirmationBar)
