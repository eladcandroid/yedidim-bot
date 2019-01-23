
exports.handleHttp = async (req, res, admin) => {

  const action = req.query['action']
  const limit = req.query['limit']
  if (action === 'removeDrafts') {
    await removeDraftEvents(admin, false, limit)
  } else if (action === 'logDrafts') {
    await removeDraftEvents(admin, true)
  }

  res.sendStatus(200)
}

const removeDraftEvents = async (admin, onlyLog, limit) => {
  const snapshot = await admin
    .database()
    .ref('/events')
    .orderByChild('status')
    .equalTo('draft')
    .once('value')
  const yesterday = new Date().getTime() - 24 * 60 * 60 * 1000
  let draftEvents = {}
  let count = 0
  snapshot.forEach((event) => {
    const eventData = event.val()
    if (eventData.timestamp && (eventData.timestamp < yesterday) && (onlyLog || !limit || count < limit)) {
      draftEvents[event.key] = null
      count++
    }
  })
  console.log('Events: ' + count)
  if (onlyLog) {
    console.log('Draft events: ' + JSON.stringify(draftEvents));
  } else {
    console.log('Deleting events: ' + JSON.stringify(draftEvents));
    await admin
      .database()
      .ref('/events')
      .update(draftEvents)
  }
}