exports.handleHttp = (req, res, admin) => {
    const sentEvents = admin
    .database()
    .ref('/events')
    .orderByChild('status')
    .equalTo('sent')
    .once('value');

    const draftEvents = admin
    .database()
    .ref('/events')
    .orderByChild('status')
    .equalTo('sent')
    .once('value');

    return Promise.all([sendEvents, draftEvents]).then(values =>{
        console.log(values);
        let sentData = values[0].val();
        let draftData = values[1].val();
        console.log(sentData);
        console.log(draftData);
        let allData = sentData.concat(draftData);
        console.log(addData);
        res.send(allData);
    })
}