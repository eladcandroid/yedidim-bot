import { Constants } from 'expo'

const firebaseInfo = {
  test: {
    // sandbox
    apiKey: 'AIzaSyDp5-02CpUQ5gyquZt2ZHSfnRjCKY5lZis',
    authDomain: 'yedidim-sandbox.firebaseapp.com',
    databaseURL: 'https://yedidim-sandbox.firebaseio.com',
    projectId: 'yedidim-sandbox',
    storageBucket: 'yedidim-sandbox.appspot.com',
    messagingSenderId: '918819260524'
  },
  development: {
    // sandbox2
    apiKey: 'AIzaSyAwKEsWodtnrprOhYXA5tFb9zbUnLqOBk4',
    authDomain: 'yedidim-sandbox-2.firebaseapp.com',
    databaseURL: 'https://yedidim-sandbox-2.firebaseio.com',
    projectId: 'yedidim-sandbox-2',
    storageBucket: 'yedidim-sandbox-2.appspot.com',
    messagingSenderId: '1011917548573'
  },
  production: {
    // production
    apiKey: 'AIzaSyC6bf7YfKoompBlyjw382AJZOzTvLaY7P0',
    authDomain: 'yedidim-production.firebaseapp.com',
    databaseURL: 'https://yedidim-production.firebaseio.com',
    projectId: 'yedidim-production',
    storageBucket: 'yedidim-production.appspot.com',
    messagingSenderId: '33558411934'
  }
}

// If releaseChannel is not set, then application is not published, then use development
// If releaseChannel is set, application is published, use it (default means no releaseChannel defined which is production)
export const environment = () => {
  if (!Constants.manifest.releaseChannel) {
    return 'development'
  }
  return Constants.manifest.releaseChannel === 'default'
    ? 'production'
    : Constants.manifest.releaseChannel
}

export const firebaseCredentials = () => firebaseInfo[environment()]

export default { firebaseCredentials, environment }
