const Amplitude = require('amplitude')
const { tokens } = require('../config')
const amplitude = new Amplitude(tokens.amplitude.key)

export default amplitude
