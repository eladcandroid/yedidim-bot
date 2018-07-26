const request = require('request')

exports.handleHttp = (req, res, tokens) => {
  const action = req.query['action']
  let data = {
    uri: 'https://graph.facebook.com/v2.6/me/messenger_profile',
    qs: { access_token: tokens.facebook.PAGE_ACCESS_TOKEN },
    gzip: true
  }
  if (action === 'set_get_started') {
    data.method = 'POST'
    data.json = {
      get_started: {
        payload: 'get_started'
      }
    }
  } else if (action === 'delete_get_started') {
    data.method = 'DELETE'
    data.json = {
      fields: ['get_started']
    }
  } else if (action === 'get_version') {
    res.send(require('../package.json').version)
    return
  } else {
    console.info('Wrong action')
    res.sendStatus(500)
    return
  }
  request(data, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      console.info(
        'Action (' + action + ') complete successfully : \n',
        data,
        body
      )
    } else {
      console.error(
        'Unable to complete action (' + action + ') : \n',
        error,
        data,
        body
      )
    }
  })
  res.sendStatus(200)
}
