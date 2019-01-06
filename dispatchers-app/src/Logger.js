import React from 'react'

import RNAmplitude from 'react-native-amplitude-analytics'
import { withContext } from 'with-context'

export const logger = new RNAmplitude('74279bbd35371930c564ecbdfedc313a')

export const Logger = React.createContext(logger)
export const withLogger = withContext(Logger, 'logger')

