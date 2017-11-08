
const chai = require('chai');
const assert = chai.assert;

const sinon = require('sinon');

const tokens = require('../_tokens.json');

describe('Verify page token', () => {

  let myFunctions;

  before(() => {
    myFunctions = require('../index');
  });
  it('Should return 200 in case of correct token', () => {
    const req = {
      query: {
        'hub.mode': 'subscribe',
        'hub.verify_token': tokens.sandbox.facebook.WEBHOOK_VERIFY_TOKEN,
        'hub.challenge': 'hub.challenge'
      },
      method: 'GET'
    };
    const res = {
      status: ((code) => {
        assert.equal(code, 200);
        return ({
          send: (text => {
            assert.equal(text, 'hub.challenge');
          })
        });
      })
    };

    myFunctions.webhook(req, res);
  });
});

describe('Geocoding', () => {
  let myFunctions, configStub, adminInitStub, functions, admin;

  before(() => {
    admin =  require('firebase-admin');
    adminInitStub = sinon.stub(admin, 'initializeApp');
    const refStub = sinon.stub();
    const databaseStub = sinon.stub(admin, 'database');
    databaseStub.returns({ref: refStub});
    refStub.withArgs('/events').returns({
      orderByChild: sinon.stub().withArgs('psid').returns({
        equalTo: sinon.stub().returns({
          once: sinon.stub().withArgs('value').returns(
            Promise.resolve({
              val: () => {return {
                '-KyM91UmqziYpQS01lwk': {
                  details: {
                    'caller name': 'Yossi Pik',
                    'car type': 'פורד',
                    case: 4,
                    more: 'כן'
                  },
                  key: '-KyM91UmqziYpQS01lwk',
                  lastMessage: 'ask_for_location',
                  psid: '1895445410472195',
                  source: 'fb-bot',
                  status: 'draft',
                  timestamp: Date.now()
                }
              }}
            })
          )
        })
      })
    });
    functions = require('firebase-functions');
    configStub = sinon.stub(functions, 'config').returns({
      firebase: {
        databaseURL: tokens.sandbox2.firebaseConfig.databaseURL,
        storageBucket: tokens.sandbox2.firebaseConfig.storageBucket
      }
    });
    myFunctions = require('../index');
  });

  after(() => {
    configStub.restore();
    adminInitStub.restore();
  });

  it('Should geocode', () => {
    const req = {
      body: {
        "object":"page",
        "entry":[{
          "id": "123",
          "time": Date.now(),
          "messaging": [{
            "sender": {"id": "1895445410472195"},
            "recipient": {"id": "112576826074737"},
            "timestamp": Date.now(),
            "message": {
              "mid": "mid.$cAABmYxKwqV5lyG9U3lflyoJpURQs",
              "seq": 11391,
              "attachments": [{
                "title": "גבעת זאב",
                "url": "https://l.facebook.com/l.php?u=https%3A%2F%2Fwww.bing.com%2Fmaps%2Fdefault.aspx%3Fv%3D2%26pc%3DFACEBK%26mid%3D8100%26where1%3DJerusalem%252C%2BIsrael%26FORM%3DFBKPL1%26mkt%3Den-US&h=ATPT3wRrlLy2hWjjQa1LHVD0jB5S6s5XadPxbNJOkYeCORB_i3M5K-8g6YwWiXPtE8oIW9d2jK3pMWrmpMaqSkqgxiLoZbmO8RJz31eYvF60slqMPw&s=1&enc=AZPGjUmrNta92VOz6HjW1tvo7gXN01KfLcjrVKK2_vYxd8V1FW6EA7UB_zIBNKOw2lG8EkwDoNLn8EJbLMzUUN1w",
                "type": "location",
                "payload": {"coordinates": {"lat": 31.863383378376, "long": 35.176407544936}}
              }]
            }
          }]
        }]
      },
      method: 'POST'
    };
    const res = {
      status: ((code) => {
        assert.equal(code, 200);
      })
    };

    myFunctions.webhook(req, res);
  });
});
