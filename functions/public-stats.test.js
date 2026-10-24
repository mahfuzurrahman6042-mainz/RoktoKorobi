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

test('country counters exclude other countries and invalid country values', () => {
  const users = {
    legacy: { isDonor: true }, india: { country: 'IN', isDonor: true },
    pakistan: { country: 'PK', isDonor: false }, invalid: { country: 'XX', isDonor: true },
  };
  assert.deepEqual(countUsers(users, 'BD'), { users: 1, donors: 1 });
  assert.deepEqual(countUsers(users, 'IN'), { users: 1, donors: 1 });
  assert.deepEqual(countUsers(users, 'PK'), { users: 1, donors: 0 });
  assert.equal(countRequests({ a: { status: 'fulfilled' }, b: { country: 'IN', fulfilled: true } }, 'BD'), 1);
  assert.equal(countRequests({ a: { status: 'fulfilled' }, b: { country: 'IN', fulfilled: true } }, 'IN'), 1);
  assert.equal(countPartners({ a: { status: 'approved' }, b: { country: 'PK', status: 'approved' } }, 'PK'), 1);
});

test('public donor total matches the super-admin available donor definition', () => {
  const users = {
    available: { isDonor: true },
    unavailable: { isDonor: true, availability: false },
    member: { isDonor: false },
  };
  assert.deepEqual(countUsers(users), { users: 3, donors: 1 });
});
