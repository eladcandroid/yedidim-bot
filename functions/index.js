const functions = require('firebase-functions');
const request = require('request');
const queue = require('async/queue');

const version = require('./package.json').version;
const tokens = getTokens(require('./_tokens.json'));
const flow = require('./flow.json');
const events = require('./events');
const notifications = require('./notifications');
const geocoder = require('./geocoder');
const EventStatus = require('./consts').EventStatus;

const sendAPIQueue = queue(callSendAPIAsync);

//Get the tokens according to the instance the functions run on
function getTokens(json) {
  if (!functions.config().instance) {
    return json.sandbox2;
  }
  if (functions.config().instance.name === 'sandbox') {
    return json.sandbox;
  }
  if (functions.config().instance.name === 'production') {
    return json.production;
  }
  return json.sandbox2;
}

const admin = require('./admin').init(tokens.firebaseCert, tokens.firebaseConfig);
const dashbot = require('dashbot')(tokens.dashbot.apiKey).facebook;

events.init(admin);
notifications.init(admin);
geocoder.init(tokens.maps.apiKey);

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
    req.query['hub.verify_token'] === tokens.facebook.WEBHOOK_VERIFY_TOKEN) {
    console.info('Webhook token is verified.');
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error('Failed to verify webhook. Make sure the verify token is correct.');
    res.sendStatus(403);
  }
}

//All webhook calls are sent in POST
function handleWebHookPostRequest(req, res) {
  let promises = [];
  const data = req.body;
  dashbot.logIncoming(data);
  try {
    if (data.object === 'page') {
      data.entry.forEach(function (entry) {
        entry.messaging.forEach(function (event) {
          //Handle each message separately
          promises.push(handleMessage(event));
        });
      });
    }
    Promise.all(promises)
      .then(() => {
        res.sendStatus(200);
      })
      .catch(err => {
        console.error(err);
        res.sendStatus(200);
      })
  } catch (err){
    //Avoid crashing the whole function
    console.error(err);
    res.sendStatus(200);
  }
}

function handleMessage(event) {
  return new Promise(resolve => {
    console.info('webhook event : \n', JSON.stringify(event));
    //Check if the bot should respond
    if (!checkIsActive()){
      console.info('Bot is not active');
      sendNotActiveResponse(event).then(() => {resolve()});
    } else {
      events.get(event.sender.id)
        .then(context => {
          if (!context ||
            (event.postback && event.postback.payload === 'get_started')) {
            //This is the first message
            sendInitialResponse(event).then(() => {resolve()});
          } else if (event.message && event.message.text === 'get started') {
            //FOR TESTING: Start again even if the user has an active event
            if (context) {
              events.delete(context);
            }
            sendInitialResponse(event).then(() => {resolve()});
          } else {
            sendFollowUpResponse(event, context).then(() => {resolve()});
          }
        })
        .catch((err) => {
          console.error(err);
          //fallback
          sendInitialResponse(event).then(() => {resolve()});
        });
    }
  });
}

function checkIsActive() {
  //The Bot is not active from Friday at 15:00 until Saturday at 19:00
  const date = new Date();
  const day = date.getUTCDay();
  const hours = date.getUTCHours();

  return !((day === 5 && hours >= 13) || (day === 6 && hours <= 17))
}

function sendNotActiveResponse(event) {
  return sendMessage(event.sender.id, getTemplate(flow.messages['general']));
}

function sendInitialResponse(event) {
  const sendPromise = sendMessage(event.sender.id, getTemplate(flow.messages['get_started']));
  let context = {
    psid: event.sender.id,
    lastMessage: 'get_started',
    source: 'fb-bot',
    status: EventStatus.Draft
  };
  const profilePromise = getUserProfile(event.sender.id)
    .then(response => {
      context.details = {'caller name': response.first_name + ' ' + response.last_name};
      events.set(context);
    })
    .catch(() => {
      //Save without the name
      events.set(context);
    });
  return Promise.all([sendPromise, profilePromise]);
}

function sendFollowUpResponse(event, context) {
  return new Promise(resolve => {
    const lastMessage = flow.messages[context.lastMessage];
    const senderID = event.sender.id;
    validateResponse(event, lastMessage)
      .then(response => {
        let promises = [];
        let sendResponse = false;
        if (response.valid) {
          setDetailsAndNextMessage(lastMessage, context, response);
          sendResponse = true;
        } else if (!response.final) {
          //In case of final message resend last message in case of additional messages from user
          const errorMessageId = response.error ? response.error : lastMessage.error;
          if (errorMessageId) {
            promises.push(sendMessage(senderID, flow.messages[errorMessageId]));
          }
          if (lastMessage.error_next) {
            context.lastMessage = lastMessage.error_next;
          }
          sendResponse = true;
        }
        if (sendResponse) {
          const nextQuestion = flow.messages[context.lastMessage];
          if (nextQuestion.pre && response.valid) {
            promises.push(sendMessage(senderID, getTextTemplate({
              text: nextQuestion.pre,
              variable: nextQuestion.variable
            }, context)));
          }
          promises.push(sendMessage(senderID, getTemplate(nextQuestion, context)));
          if (nextQuestion.submit) {
            context.status = EventStatus.Submitted;
            promises.push(notifications.send(context.details));
          }
          promises.push(events.set(context));
        }
        Promise.all(promises).then(() => {resolve()});
      })
      .catch(err => {
        console.error(err);
        sendTypingMessage(senderID, false).then(() => {resolve()});
      })
  });
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
      resolve({valid: true, payload: (lastMessage.type === 'quick_replies' && event.message && event.message.quick_reply) ? event.message.quick_reply.payload : event.postback.payload})
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
            resolve({valid: true, location: {coordinates, address: geocoder.toAddress(res)}});
          })
          .catch(() => {
            resolve({valid: false});
          })
      } else {
        //Get geocoding from address
        const userAddress = event.message.text;
        geocoder.geocode(userAddress)
          .then(res => {
            if (!geocoder.verify(res)){
              console.log('Invalid geocode address', res);
              resolve({valid: false});
            }
            resolve({valid: true, location: {coordinates: {lat: res[0].latitude, lon: res[0].longitude}, address: geocoder.toAddress(res), userAddress}});
          })
          .catch(() => {
            resolve({valid: false});
          });
      }
    } else if (lastMessage.final){
      resolve({valid: false, final: true});
    } else if (!event.message.text){
      resolve({valid: false});
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
      context.details[lastMessage.field] = payload.case || payload.case === 0 ? payload.case : payload.title;
    }
    //In case of next use it otherwise the payload is the next
    context.lastMessage = payload.next ? payload.next : response.payload;
  } else if (lastMessage.validate === 'location') {
    context.details['geo'] = response.location.coordinates;
    context.details['address'] = response.location.address.formattedAddress;
    context.details['city'] = response.location.address.city;
    context.details['street_name'] = response.location.address.streetName;
    context.details['street_number'] = response.location.address.streetNumber;
    if (response.location.userAddress) {
      context.details['user_address'] = response.location.userAddress;
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
  let reply = {
    text: replaceTextVariable(message, context)
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
  return {
    text: replaceTextVariable(message, context)
  }
}

function replaceTextVariable(message, context) {
  if (message.variable && context.details) {
    // console.info("replaceTextVariable: context - " + JSON.stringify(context) + " ; message - " + JSON.stringify(message));
    return message.text.replace(/{variable}/, context.details[message.variable]);
  }
  return message.text;
}

function sendTypingMessage(recipientId, on) {
  return callSendAPI({
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
  return callSendAPI(messageData);
}

function callSendAPIAsync(messageData, callback) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token: tokens.facebook.PAGE_ACCESS_TOKEN},
    method: 'POST',
    json: messageData

  }, callback);
}

function callSendAPI(messageData) {
  return new Promise(resolve => {
    sendAPIQueue.push(messageData, ((error, response, body) => {
      if (!error && response.statusCode === 200) {
        console.info('Successfully sent message : \n', JSON.stringify(messageData), body);
      } else {
        console.error('Unable to send message. : \n', JSON.stringify(messageData), error, body);
      }
      dashbot.logOutgoing(messageData, response.body);
      resolve();
    }));
  })
}

function getUserProfile(psid) {
  return new Promise((resolve, reject) => {
    request({
      uri: 'https://graph.facebook.com/v2.6/' + psid,
      qs: {
        access_token: tokens.facebook.PAGE_ACCESS_TOKEN,
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
    qs: {access_token: tokens.facebook.PAGE_ACCESS_TOKEN},
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
  } else if (action === 'get_version') {
    res.send(version);
    return;
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
