exports.updateIsOpenProperty = (event, eventId) => {
  const eventData = event.data.val()
  if (!eventData) {
    console.log('[onUpdateEvent] No event data, returning', eventId)
    return Promise.resolve()
  }
  const isOpen =
    eventData.status === 'submitted' ||
    eventData.status === 'sent' ||
    eventData.status === 'assigned' ||
    eventData.status === 'taken'

  if (
    !event.data.previous.exists() ||
    event.data.previous.val().isOpen !== isOpen
  ) {
    console.log('[onUpdateEvent] Updating isOpen for ', isOpen, eventId)
    return event.data.ref.update({ isOpen })
  } else {
    console.log('[onUpdateEvent] Not updating isOpen', eventId)
    return Promise.resolve()
  }
}
