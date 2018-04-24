/* eslint-disable */
const fs = require('fs')

const glob = require('glob')
const mkdirp = require('mkdirp')

const globSync = glob.sync
const mkdirpSync = mkdirp.sync

const filePattern = './i18n/messages/**/*.json'
const outputDir = './i18n/locales/'

const translate = require('google-translate-api')

// Aggregates the default messages that were extracted from the example app's
// React components via the React Intl Babel plugin. An error will be thrown if
// there are messages in different components that use the same `id`. The result
// is a flat collection of `id: message` pairs for the app's default locale.
const defaultMessages = globSync(filePattern)
  .map(filename => fs.readFileSync(filename, 'utf8'))
  .map(file => JSON.parse(file))
  .reduce((collection, descriptors) => {
    descriptors.forEach(({ id, defaultMessage }) => {
      if (collection.hasOwnProperty(id)) {
        throw new Error(`Duplicate message id: ${id}`)
      }
      collection[id] = defaultMessage
    })

    return collection
  }, {})
// Create a new directory that we want to write the aggregate messages to
mkdirpSync(outputDir)
;(async function() {
  const heDefaultMessages = {}

  const keys = Object.keys(defaultMessages)

  for (let key of keys) {
    const { text } = await translate(defaultMessages[key], { to: 'iw' })
    heDefaultMessages[key] = text
    console.log('Translating from en to he...', key, text)
  }

  fs.writeFileSync(
    `${outputDir}he.json`,
    JSON.stringify(heDefaultMessages, null, 2)
  )
})()

// Write the messages to this directory
fs.writeFileSync(
  `${outputDir}en.json`,
  JSON.stringify(defaultMessages, null, 2)
)
