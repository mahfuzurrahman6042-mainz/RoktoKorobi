const test = require('node:test');
const assert = require('node:assert/strict');
const { notificationPayload, canSendCountryAlert, becamePublishableCountryRequest } = require('./notification-payload');

test('India and Pakistan push messages omit patient and blood details', () => {
  for (const country of ['IN', 'PK']) {
    const payload = notificationPayload('request-123', country, 'AB+');
    const serialized = JSON.stringify(payload);
    assert.equal(payload.data.country, country);
    assert.equal(payload.data.requestId, 'request-123');
    assert.doesNotMatch(serialized, /AB\+|patient|hospital|phone/i);
    assert.match(payload.notification.body, /Sign in to view/);
  }
});

test('Bangladesh notification retains its existing blood-group wording', () => {
  const payload = notificationPayload('request-123', 'BD', 'O-');
  assert.equal(payload.data.bloodType, 'O-');
  assert.match(payload.notification.body, /O- blood request/);
});

test('new-country alerts fail closed for pending requests or an unset alert switch', () => {
  for (const country of ['IN', 'PK']) {
    assert.equal(canSendCountryAlert(country, { status: 'pending' }, true, true), false);
    assert.equal(canSendCountryAlert(country, { status: 'open' }, true, undefined), false);
    assert.equal(canSendCountryAlert(country, { status: 'approved' }, false, true), false);
    assert.equal(canSendCountryAlert(country, { status: 'open', fulfilled: true }, true, true), false);
    assert.equal(canSendCountryAlert(country, { status: 'open' }, true, true), true);
  }
  assert.equal(canSendCountryAlert('BD', { status: 'pending' }, false, false), true);
});

test('only a newly approved or opened country request starts an alert attempt', () => {
  for (const country of ['IN', 'PK']) {
    assert.equal(becamePublishableCountryRequest(country, null, { status: 'pending' }), false);
    assert.equal(becamePublishableCountryRequest(country, { status: 'pending' }, { status: 'approved' }), true);
    assert.equal(becamePublishableCountryRequest(country, { status: 'pending' }, { status: 'open' }), true);
    assert.equal(becamePublishableCountryRequest(country, null, { status: 'approved' }), true);
    assert.equal(becamePublishableCountryRequest(country, { status: 'approved' }, { status: 'approved', message: 'edited' }), false);
    assert.equal(becamePublishableCountryRequest(country, { status: 'approved' }, { status: 'fulfilled', fulfilled: true }), false);
    assert.equal(becamePublishableCountryRequest(country, { status: 'pending' }, { status: 'approved', fulfilled: true }), false);
  }
  assert.equal(becamePublishableCountryRequest('BD', { status: 'pending' }, { status: 'approved' }), false);
});
