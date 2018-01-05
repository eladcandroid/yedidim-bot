exports.onWrite = (event) => {
	const eventData = event.data.val();
	const isOpen = eventData.status === 'submitted' || eventData.status === 'sent' || eventData.status === 'assigned';

	if (!event.data.previous.exists() || event.data.previous.val().isOpen !== isOpen){
	  console.log('isOpen = ' + isOpen);
	  return event.data.ref.update({isOpen});
  } else {
		return Promise.resolve();
	}
};
