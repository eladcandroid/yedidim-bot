import { Amplitude } from 'expo'
import { getInstance } from './common/utils'

const amplitudeConfig = {
  development: {
    apiKey: '66884f4c8e2b41c417a93f26a5bbe9b4'
  },
  production: {
    apiKey: '6a5f4a2d31bd38231881693dd49e62c5'
  }
}

Amplitude.initialize(amplitudeConfig[getInstance()].apiKey)

export const logger = Amplitude
