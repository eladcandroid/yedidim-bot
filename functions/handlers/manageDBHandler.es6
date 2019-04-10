
exports.handleHttp = async (req, res, admin) => {
  const action = req.query['action']
  const limit = req.query['limit']
  if (action === 'removeOldEvents') {
    await removeOldEvents(admin, false, limit)
  } else if (action === 'logOldEvents') {
    await removeOldEvents(admin, true)
  }

  res.sendStatus(200)
}

const removeOldEvents = async (admin, onlyLog, limit) => {
  const draftEvents = await getDraftEvents(admin)
  const noStatusEvents = await getNoStatusEvents(admin)
  let oldEvents = {}
  let count = 0

  const deleteEvent = function (event) {
    const eventData = event.val()
    console.log('Found event [' + event.key + ']:', eventData)
    if (noTimestampOrOld(eventData) && (onlyLog || !limit || count < limit)) {
      console.log('Found event ID:', event.key)
      oldEvents[event.key] = null
      count++
    }
  }

  console.log('Draft events...')
  draftEvents.forEach(deleteEvent)
  console.log('No status events...')
  noStatusEvents.forEach(deleteEvent)

  console.log('Events: ' + count)
  if (onlyLog) {
    console.log('Old events: ' + JSON.stringify(oldEvents));
  } else {
    console.log('Deleting events: ' + JSON.stringify(oldEvents));
    await admin
      .database()
      .ref('/events')
      .update(oldEvents)
  }
}

const getDraftEvents = async (admin) => {
  const draftEvents = await admin
    .database()
    .ref('/events')
    .orderByChild('status')
    .equalTo('draft')
    .once('value')

    return draftEvents
}

const getNoStatusEvents = async (admin) => {
    const noStatusEvents = await admin
    .database()
    .ref('/events')
    .orderByChild('status')
    .equalTo(null)
    .once('value')

    return noStatusEvents
}

const noTimestampOrOld = function (event) {
  const yesterday = new Date().getTime() - 24 * 60 * 60 * 1000

  if (!event.timestamp) {
    return true
  }

  if (event.timestamp < yesterday) {
    return true
  }

  return false
}