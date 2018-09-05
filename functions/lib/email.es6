let rp = require('request-promise')
let { tokens } = require('../config')

const sendNotifications = async ({
  title,
  message,
  appType,
  include_player_ids
}) => {
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
          to: include_player_ids.map(userId => ({ email: userId })),
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

export const sendEmailNotificationByEmails = async props => {
  console.log('[Email] Sending event notification', props)
  const { title, message, data, userIds, appType } = props

  try {
    const results = await sendNotifications({
      include_player_ids: userIds,
      title,
      message,
      data,
      appType
    })
    console.log('[Email] Success test notifications', results)
    return results
  } catch (error) {
    console.log('[Email] Fail test notifications', error)
    throw error
  }
}
