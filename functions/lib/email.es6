let rp = require('request-promise')
let { tokens } = require('../config')

const sendNotifications = async ({ title, message, appType, emails }) => {
  return rp({
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: `Bearer ${tokens.sendgrid.RestApiToken}`
    },
    uri: 'https://api.sendgrid.com/v3/mail/send',
    body: {
      personalizations: [
        {
          to: emails.map(userId => ({ email: userId })),
          subject: `[${
            appType === 'dispatchers' ? 'מוקדנים' : 'כוננים'
          }] ${title}`
        }
      ],
      from: {
        email: 'startsach@gmail.com'
      },
      content: [
        {
          type: 'text/plain',
          value: message
        }
      ]
    },
    json: true // Automatically stringifies the body to JSON
  })
}

export default sendNotifications
