const commonPlugins = [
  [
    'babel-plugin-module-resolver',
    {
      root: ['./src']
    }
  ],
  [
    'react-intl',
    {
      messagesDir: './i18n/messages',
      enforceDescriptions: false
    }
  ]
]

const devPlugins = ['@babel/plugin-transform-react-jsx-source']

module.exports = function(api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    plugins: [...commonPlugins],
    env: {
      development: {
        plugins: [...devPlugins]
      }
    }
  }
}
