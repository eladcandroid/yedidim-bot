import React from 'react'
import PropTypes from 'prop-types'

import RNAmplitude from 'react-native-amplitude-analytics'

export class Logger extends React.Component {
  constructor (props) {
    super(props)
    this.init()
    this.logger = {}
  }

  static propTypes = {
    key: PropTypes.string.isRequired
  }

  static childContextTypes = {
    logger: PropTypes.object
  }

  init () {
    const { key } = this.props
    const amplitude = new RNAmplitude(key)
    this.logger = {
      setUserId: amplitude.setUserId,
      setUserProperties: amplitude.setUserProperties,
      logEvent: amplitude.logEvent
    }
  }

  getChildContext () {
    return { logger: this.logger }
  }

  render () {
    return React.Children.only(this.props.children)
  }
}
