const { test } = require('node:test');
const assert = require('node:assert/strict');
const { countUsers, countRequests, countPartners } = require('./public-stats');

test('public counts include only defined categories', () => {
  assert.deepEqual(countUsers({ a: { isDonor: true }, b: { isDonor: false }, c: {} }), { users: 3, donors: 1 });
  assert.equal(countRequests({ a: { fulfilled: true }, b: { status: 'completed' }, c: { status: 'pending' } }), 2);
  assert.equal(countPartners({ a: { status: 'approved' }, b: { status: 'pending' }, c: { status: 'suspended' } }), 1);
});

test('missing collections have zero records', () => {
  assert.deepEqual(countUsers(null), { users: 0, donors: 0 });
  assert.equal(countRequests(null), 0);
  assert.equal(countPartners(null), 0);
});
