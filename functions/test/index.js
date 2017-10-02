const functions = require('../index');

const chai = require('chai');
const assert = chai.assert;

const tokens = require('../_tokens.json');

describe('Verify page token', () => {

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

    functions.webhook(req, res);
  });
});