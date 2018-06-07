const { sendNotificationByUserIds } = require('../lib/onesignal')

const normalizePhone = phone =>
  phone.charAt(0) === '0' ? '+972' + phone.substr(1) : phone

// if dispatcher then "/dispatchers"
// otherwise admin or volunteer - "/volunteer"
const userRoleToPath = (role, userId) =>
  `/${role === 'dispatcher' ? 'dispatchers' : 'volunteer'}/${userId}`

const userToJSON = (key, val, role) => {
  if (role === 'dispatcher') {
    return {
      role: 'dispatcher',
      key,
      val,
      phone: normalizePhone(val.phone),
      token: val.token,
      appType: 'dispatchers'
    }
  } else {
    return {
      role: 'volunteer',
      key,
      val,
      phone: normalizePhone(val.MobilePhone),
      token: val.NotificationToken,
      appType: 'volunteers'
    }
  }
}

exports.sendTestNotification = async (req, res, admin) => {
  const { userId, role } = req.body

  console.log(
    `[SendTestNotification]A: Sending test notification to specific user`,
    userId,
    role
  )
  // Grab only one user
  const user = await admin
    .database()
    .ref(userRoleToPath(role, userId))
    .once('value')

  const userInfo = userToJSON(user.key, user.val(), role)

  if (!userInfo || !userInfo.token) {
    console.log(
      `[SendTestNotification][Error] Abort, User not found`,
      userId,
      role
    )
    res.status(404).send(`User ${userInfo.key} or user token not found`)
    return
  }

  console.log(
    `[SendTestNotification]B: Sending notifications to user`,
    userInfo.key
  )

  // {title, message, data, userIds, appType}
  const receipt = await sendNotificationByUserIds({
    userIds: [userInfo.token],
    title: 'בדיקת התראות לישום',
    message: 'נא לפתוח התראה הזאת כדי לאשר קבלה. לא מדובר באירוע.',
    data: {
      type: 'test',
      userId: userInfo.key
    },
    appType: userInfo.appType
  })

  // 4. Interpret results and write results
  console.log(
    `[SendTestNotification]D: Writing new status based on receipts for users`,
    receipt
  )

  // TODO
  res.status(200).end()
}

const updateEventNotificationStatus = async (admin, eventId, sent, error) => {
  console.log(`[updateEventNotificationStatus]`, eventId, sent, error)

  return admin
    .database()
    .ref(`/events/${eventId}/notifications/volunteers`)
    .update({
      sent: sent.reduce((acc, userId) => {
        acc[userId] = false
        return acc
      }, {}),
      error: error.reduce((acc, userId) => {
        acc[userId] = true
        return acc
      }, {})
    })
}
