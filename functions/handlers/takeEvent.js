exports.handleHttp = (req,res,admin) => {
    console.log('call takeEvent',req.body, req.body.eventId, req.body.volunteerId, '/events/' + req.body.eventId);

    if(!req.body.eventId || !req.body.volunteerId){
        return res.status(404).send({message : "can't find volunteer or event"});
    }

    let promise = admin.database().ref('/events/' + req.body.eventId).once('value');

    return Promise.resolve(promise).then(t => {

        if (!t.hasChildren()) {
            return console.log('There are no event');
          }

        const value = t.val();
        console.log('There are', t.numChildren(), 'events');
        console.log();
        console.log('found event ',value);

        const currentVoluneerId = value.assignedTo;

        
        if(currentVoluneerId || value.status === "completed" || value.status == "assigned" ){
            console.log('event already took by volunteer ', currentVoluneerId);
            res.status(400).send({ message: 'event already took'});
        }
        else {
             admin.database().ref('/events/' + req.body.eventId + '/assignedTo')
            .set(req.body.volunteerId);

            admin
            .database()
            .ref('/events/' + req.body.eventId + '/status')
            .set('assigned')
            .then(res.status(200).send({message : 'OK!'}));
        }
    })
};
