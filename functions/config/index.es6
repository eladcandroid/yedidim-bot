const functions = require('firebase-functions')

const instance =
  (functions.config().instance && functions.config().instance.name) ||
  'sandbox2'

const tokens = require('../_tokens.json')[instance]

console.log('Took tokens for ', instance)

module.exports = {
  instance,
  tokens
}
