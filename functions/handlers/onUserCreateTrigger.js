exports.handleTrigger = (event, admin) => {
	if (event.data.previous.exists()) {
		return Promise.resolve();
	}

	// Exit when the data is deleted.
	if (!event.data.exists()) {
    return Promise.resolve();
	}

	const original = event.data.val();
	console.log(original);
	const mobilePhone = original.MobilePhone;
	console.log(mobilePhone);
	if (!mobilePhone || mobilePhone.length === 0) {
    return Promise.resolve();
	}

	return admin
		.database()
		.ref('/phones/' + mobilePhone)
		.set(1);
};
