import test from 'node:test';
import assert from 'node:assert/strict';
import { countCountryPublicStats } from '../lib/country-stats.ts';

test('homepage totals never blend Bangladesh, India, and Pakistan', () => {
  const users = {
    legacy: { isDonor: true },
    india: { country: 'IN', isDonor: true },
    pakistan: { country: 'PK', isDonor: false },
    bad: { country: 'XX', isDonor: true },
  };
  const partners = {
    legacy: { status: 'approved' },
    india: { country: 'IN', status: 'approved' },
    pakistan: { country: 'PK', status: 'pending' },
  };
  const requests = { legacy: { status: 'fulfilled' }, india: { country: 'IN', fulfilled: true } };
  assert.deepEqual(countCountryPublicStats('BD', users, partners, requests, 100), { users: 1, donors: 1, requestsFulfilled: 1, partners: 1, updatedAt: 100 });
  assert.deepEqual(countCountryPublicStats('IN', users, partners, requests, 100), { users: 1, donors: 1, requestsFulfilled: 1, partners: 1, updatedAt: 100 });
  assert.deepEqual(countCountryPublicStats('PK', users, partners, requests, 100), { users: 1, donors: 0, requestsFulfilled: 0, partners: 0, updatedAt: 100 });
});

test('homepage donor count excludes unavailable donors like the super-admin dashboard', () => {
  const users = {
    available: { isDonor: true },
    unavailable: { isDonor: true, availability: false },
    member: { isDonor: false },
  };
  assert.deepEqual(countCountryPublicStats('BD', users, {}, {}, 100), {
    users: 3, donors: 1, requestsFulfilled: 0, partners: 0, updatedAt: 100,
  });
});
