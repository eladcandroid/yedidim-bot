const Amplitude = require('amplitude')
const tokens = getTokens(require('../_tokens.json'))
const amplitude = new Amplitude(tokens.amplitude.key)

export const track = amplitude.track
export const identify = amplitude.identify
