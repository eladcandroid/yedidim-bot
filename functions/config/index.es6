const functions = require('firebase-functions')

const instance =
  (functions.config().instance && functions.config().instance.name) ||
  'sandbox2'

const config = {
  instance
}

exports = config
