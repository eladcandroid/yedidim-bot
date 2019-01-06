import React from 'react'

import RNAmplitude from 'react-native-amplitude-analytics'
import { withContext } from 'with-context'
import { getInstance } from './common/utils'

const amplitudeConfig = {
  development: {
    apiKey: '66884f4c8e2b41c417a93f26a5bbe9b4'
  },
  production: {
    apiKey: '6a5f4a2d31bd38231881693dd49e62c5'
  }
}

export const logger = new RNAmplitude(amplitudeConfig[getInstance()].apiKey)

export const Logger = React.createContext(logger)
export const withLogger = withContext(Logger, 'logger')
