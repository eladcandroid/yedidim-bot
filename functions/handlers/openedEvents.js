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

    return Promise.all([sentEvents, draftEvents]).then(values =>{
       // console.log(values);

       
       let sentData = convertToArray(values[0].val());
       let draftData = convertToArray(values[1].val());
       let allData = sentData.concat(draftData);
       res.send(allData);
    })
}

function convertToArray(firebaseCollection){
    if(firebaseCollection === undefined || firebaseCollection === null){
        return [];
    }

    let res = [];

    let keys = Object.keys(firebaseCollection);

    for(i=0;i<keys.length;i++){
        let k = keys[i];
        res.push(firebaseCollection[k]);
    }
    
    return res;
}

