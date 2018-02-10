exports.onWrite = (event) => {
	const eventData = event.data.val();
	if (!eventData){
    return Promise.resolve();
  }
	const isOpen = eventData.status === 'submitted' || eventData.status === 'sent' || eventData.status === 'assigned' || eventData.status === 'taken';

	if (!event.data.previous.exists() || event.data.previous.val().isOpen !== isOpen){
	  console.log('isOpen = ' + isOpen);
	  return event.data.ref.update({isOpen});
  } else {
		return Promise.resolve();
	}
};
