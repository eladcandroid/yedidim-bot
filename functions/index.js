const functions = require('firebase-functions');
const request = require('request');
const queue = require('async/queue');

const tokens = require('./_facebookTokens.json');
const flow = require('./flow.json');
const calls = require('./calls');
const geocoder = require('./geocoder');

const sendAPIQueue = queue(callSendAPIAsync);

//Main http function to handle all webhook calls
exports.webhook = functions.https.onRequest((req, res) => {
  if (req.method === 'GET'){
    handleWebHookGetRequest(req, res);
  } else if (req.method === 'POST') {
    handleWebHookPostRequest(req, res);
  } else {
    res.sendStatus(500);
  }
});

//Sent when registering the webhook
function handleWebHookGetRequest(req, res){
  if (req.query['hub.mode'] === 'subscribe' &&
    req.query['hub.verify_token'] === tokens.WEBHOOK_VERIFY_TOKEN) {
    console.info('Webhook token is verified.');
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error('Failed to verify webhook. Make sure the verify token is correct.');
    res.sendStatus(403);
  }
}

//All webhook calls are sent in POST
function handleWebHookPostRequest(req, res) {
  const data = req.body;
  if (data.object === 'page') {
    data.entry.forEach(function(entry) {
      entry.messaging.forEach(function(event) {
        try {
          //Handle each message separately
          handleMessage(event);
        } catch (err) {
          console.error('Failed to handle message. Error : \n', err);
        }
      });
    });
    res.sendStatus(200);
  }
}

function handleMessage(event) {
  console.info('webhook event : \n', event);
  sendTypingMessage(event.sender.id, true);

  calls.get(event.sender.id)
    .then(context => {
      if (!context ||
          (event.postback && event.postback.payload === 'get_started') ||
          (event.message && event.message.text === 'get started') //FOR TESTING: Start again even if the user has an active call
      ){
        //This is the first message
        sendInitialResponse(event);
      } else {
        sendFollowUpResponse(event, context);
      }
    })
    .catch((err) => {
      console.error(err);
      //fallback
      sendInitialResponse(event);
    });
}

function sendInitialResponse(event) {
  sendMessage(event.sender.id, getTemplate(flow.messages['get_started']));
  getUserProfile(event.sender.id)
    .then(response => {
      const context = {
        lastMessage: 'get_started',
        details: {
          'caller name': response.first_name + ' ' + response.last_name
        }
      };
      calls.set(event.sender.id, context);
    })
    .catch(() => {
      //Save without the name
      calls.set(event.sender.id, {lastMessage: 'get_started'});
    });
}

function sendFollowUpResponse(event, context) {
  const lastMessage = flow.messages[context.lastMessage];
  const senderID = event.sender.id;
  validateResponse(event, lastMessage)
    .then(response => {
      if (response.valid) {
        setDetailsAndNextMessage(lastMessage, context, response);
      } else if (!response.final) {
        //In case of final message resend last message in case of additional messages from user
        sendMessage(senderID, flow.messages[response.error ? response.error : lastMessage.error]);
      }
      const nextQuestion = flow.messages[context.lastMessage];
      if (nextQuestion.pre && response.valid){
        sendMessage(senderID, getTextTemplate({text: nextQuestion.pre, variable: nextQuestion.variable}, context));
      }
      sendMessage(senderID, getTemplate(nextQuestion, context));
      calls.set(senderID, context);
    })
    .catch(err => {
      console.error(err);
      sendTypingMessage(senderID, false);
    })
}

function validateResponse(event, lastMessage) {
  return new Promise((resolve) => {
    if (event.postback && !lastMessage.buttons){
      //Sending postback although last question was not from buttons
      resolve({valid: false});
    } else if (lastMessage.buttons) {
      if (!(event.postback && event.postback.payload) && !(event.message && event.message.quick_reply && event.message.quick_reply.payload)) {
        //Last message was a selection but nothing was selected
        //Ask again to select from the list
        resolve({valid: false, error: 'select_answer'});
      }
      //Return the selected answer
      resolve({valid: true, payload: lastMessage.type === 'quick_replies' ? event.message.quick_reply.payload : event.postback.payload})
    } else if (lastMessage.validate && lastMessage.validate === 'phone') {
      //Validate that this is a valid phone number
      if (!/^(?:0(?!([57]))(?:[23489]))(?:-?\d){7}$|^(0(?=[57])(?:-?\d){9})$/g.test(event.message.text)) {
        resolve({valid: false});
      }
      //Return the phone
      resolve({valid: true, text: event.message.text})
    } else if (lastMessage.validate && lastMessage.validate === 'location') {
      if (event.message && event.message.attachments && event.message.attachments.length > 0 && event.message.attachments[0].type === 'location'){
        //The location was entered as an object - need to get the address
        const coordinates = {lat: event.message.attachments[0].payload.coordinates.lat, lon: event.message.attachments[0].payload.coordinates.long};
        geocoder.reverse(coordinates)
          .then(res => {
            resolve({valid: true, location: {coordinates, address: res[0].formattedAddress}});
          })
          .catch(() => {
            resolve({valid: false});
          })
      } else {
        //Get geocoding from address
        const address = event.message.text;
        geocoder.geocode(address)
          .then(res => {
            if (!geocoder.verify(res)){
              resolve({valid: false});
            }
            resolve({valid: true, location: {coordinates: {lat: res[0].latitude, lon: res[0].longitude}, address, formattedAddress: res[0].formattedAddress}});
          })
          .catch(() => {
            resolve({valid: false});
          });
      }
    } else if (lastMessage.final){
      resolve({valid: false, final: true});
    } else {
      resolve({valid: true, text: event.message.text});
    }
  });
}

function setDetailsAndNextMessage(lastMessage, context, response) {
  if (!context.details){
    context.details = {};
  }
  if (lastMessage.buttons) {
    const payload = flow.payloads[response.payload];
    if (lastMessage.field) {
      context.details[lastMessage.field] = payload.case ? payload.case : payload.title;
    }
    //In case of next use it otherwise the payload is the next
    context.lastMessage = payload.next ? payload.next : response.payload;
  } else if (lastMessage.validate === 'location') {
    context.details['address'] = response.location.address;
    context.details['geo'] = response.location.coordinates;
    if (response.location.formattedAddress) {
      context.details['full_address'] = response.location.formattedAddress;
    }
    context.lastMessage = lastMessage.next;
  } else {
    if (lastMessage.field) {
      context.details[lastMessage.field] = response.text;
    }
    context.lastMessage = lastMessage.next;
  }
}

function getTemplate(message, context) {
  if (message.type === 'quick_replies') {
    return getQuickRepliesTemplate(message, context);
  }
  if (message.buttons) {
    return getButtonsTemplate(message);
  }
  return getTextTemplate(message, context);
}

function getButtonsTemplate(message) {
  let reply = {
    'attachment': {
      'type': 'template',
    }
  };
  let payload = {
    template_type: message.type ? message.type : 'button'
  };
  let buttons = [];

  message.buttons.map(button => {
    buttons.push({type: 'postback', title: flow.payloads[button.payload].title, payload: button.payload});
  });
  if (message.type === 'generic'){
    payload.elements = [{
      title: message.title,
      subtitle: message.subtitle,
      image_url: message.image_url,
      buttons
    }];
  } else {
    payload.text = message.text;
    payload.buttons = buttons;
  }
  reply.attachment.payload = payload;
  return reply;
}

function getQuickRepliesTemplate(message, context){
  replaceTextVariable(message, context);
  let reply = {
    text: message.text
  };
  if (message.buttons) {
    reply.quick_replies = [];
    message.buttons.map(button => {
      reply.quick_replies.push({content_type: 'text', title: flow.payloads[button.payload].title, payload: button.payload});
    });
  } else {
    reply.quick_replies = message.quick_replies;
  }
  return reply;
}

function getTextTemplate(message, context) {
  replaceTextVariable(message, context);
  return {
    text: message.text
  }
}

function replaceTextVariable(message, context) {
  if (message.variable && context.details) {
    message.text = message.text.replace(/{variable}/, context.details[message.variable]);
  }
}

function sendTypingMessage(recipientId, on) {
  callSendAPI({
    recipient: {
      id: recipientId
    },
    sender_action: 'typing_' + (on ? 'on' : 'off')
  });
}

function sendMessage(recipientId, message) {
  const messageData = {
    recipient: {
      id: recipientId
    },
    message
  };
  callSendAPI(messageData);
}

function callSendAPIAsync(messageData, callback) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token: tokens.PAGE_ACCESS_TOKEN},
    method: 'POST',
    json: messageData

  }, callback);
}

function callSendAPI(messageData) {
  sendAPIQueue.push(messageData, ((error, response, body) => {
    if (!error && response.statusCode === 200) {
      console.info('Successfully sent message : \n', JSON.stringify(messageData), body);
    } else {
      console.error('Unable to send message. : \n', JSON.stringify(messageData), error, body);
    }
  }));
}

function getUserProfile(psid) {
  return new Promise((resolve, reject) => {
    request({
      uri: 'https://graph.facebook.com/v2.6/' + psid,
      qs: {
        access_token: tokens.PAGE_ACCESS_TOKEN,
        fields: 'first_name,last_name'
      },
      method: 'GET'
    }, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        console.info('Successfully retrieved user profile (' + psid + ') : \n', body);
        resolve(JSON.parse(body));
      } else {
        console.error('Failed to retrieve user profile (' + psid + ') : \n', error, body);
        reject(error);
      }
    });
  });
}

//function for managing the bot
exports.manage = functions.https.onRequest((req, res) => {
  const action = req.query['action'];
  let data = {
    uri: 'https://graph.facebook.com/v2.6/me/messenger_profile',
    qs: {access_token: tokens.PAGE_ACCESS_TOKEN},
    gzip: true
  };
  if (action === 'set_get_started'){
    data.method = 'POST';
    data.json = {
      'get_started': {
        'payload': 'get_started'
      }
    };
  } else if (action === 'delete_get_started'){
    data.method = 'DELETE';
    data.json = {
      'fields': ['get_started']
    };
  } else {
    console.info('Wrong action');
    res.sendStatus(500);
    return;
  }
  request(data, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      console.info('Action (' + action + ') complete successfully : \n', data, body);
    } else {
      console.error('Unable to complete action (' + action + ') : \n', error, data, body);
    }
  });
  res.sendStatus(200);
});
