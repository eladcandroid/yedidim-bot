import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Modal, Text, View, TouchableHighlight, StyleSheet } from 'react-native'
import { Item, Input } from 'native-base'

export class Prompt extends Component {
  constructor(props) {
    super(props)
    this.state = { value: props.defaultValue ? props.defaultValue : '' }
  }
  render() {
    return (
      <View>
        <Modal
          animationType={'slide'}
          transparent={true}
          visible={this.props.visible}
          onRequestClose={this.props.onCancel}
          onDismiss={this.props.onCancel}
        >
          <View style={styles.modalScreen}>
            <View style={styles.modalDialog}>
              <Text style={styles.modalTitle}>{this.props.title}</Text>
              <Item>
                <Input
                  style={styles.input}
                  onChangeText={value => this.setState({ value })}
                  keyboardType="numeric"
                  autoFocus={false}
                  returnKeyType="send"
                  onSubmitEditing={() => this.props.onSubmit(this.state.value)}
                  value={this.state.value}
                />
              </Item>
              <View style={styles.buttons}>
                <TouchableHighlight
                  style={styles.button}
                  underlayColor="#f1f1f1"
                  onPress={() => this.props.onSubmit(this.state.value)}
                >
                  <Text style={styles.buttonText}>
                    {this.props.submitText ? this.props.submitText : 'אשר'}
                  </Text>
                </TouchableHighlight>
                <View style={styles.buttonsDivider} />
                <TouchableHighlight
                  style={styles.button}
                  underlayColor="#f1f1f1"
                  onPress={this.props.onCancel}
                >
                  <Text style={styles.buttonText}>
                    {this.props.cancelText ? this.props.cancelText : 'בטל'}
                  </Text>
                </TouchableHighlight>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    )
  }
}

Prompt.propTypes = {
  visible: PropTypes.bool,
  title: PropTypes.string.isRequired,
  onCancel: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  submitButtonText: PropTypes.string,
  cancelButtonText: PropTypes.string
}

const styles = StyleSheet.create({
  modalScreen: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  modalDialog: {
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    padding: 10,
    textAlign: 'center'
  },
  input: {
    alignSelf: 'stretch',
    textAlign: 'center',
    fontSize: 15,
    paddingLeft: 20,
    paddingRight: 20,
    padding: 0
  },
  buttons: {
    height: 50,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: '#D9D5DC'
  },
  buttonsDivider: {
    width: 1,
    borderLeftWidth: 1,
    borderColor: '#D9D5DC'
  },
  button: {
    flex: 0.5
  },
  buttonText: {
    fontSize: 17,
    lineHeight: 50,
    color: '#0076ff',
    alignSelf: 'center'
  }
})
