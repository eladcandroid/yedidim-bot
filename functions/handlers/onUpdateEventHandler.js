exports.updateIsOpenProperty = (eventId, change) => {
	const eventData = change.after.val();
	if (!eventData){
    return Promise.resolve();
  }
	const isOpen = eventData.status === 'submitted' || eventData.status === 'sent' || eventData.status === 'assigned' || eventData.status === 'taken';

	if (!change.before.exists() || change.before.val().isOpen !== isOpen){
	  console.log('isOpen = ' + isOpen);
	  return change.after.ref.update({isOpen});
  } else {
		return Promise.resolve();
	}
};
