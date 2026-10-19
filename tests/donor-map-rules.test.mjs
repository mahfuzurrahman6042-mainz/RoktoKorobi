import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';

test('public donor map requires verified, explicit donor opt-in and excludes private fields', async () => {
  const environment = await initializeTestEnvironment({
    projectId: 'demo-roktokorobi-map-rules',
    database: { host: '127.0.0.1', port: 9000, rules: readFileSync(new URL('../database.rules.json', import.meta.url), 'utf8') },
  });
  try {
    await environment.withSecurityRulesDisabled(async context => {
      await context.database().ref().set({
        admins: { super_admin: { email: 'owner@example.org' } },
        users: {
          donor: { uid: 'donor', email: 'donor@example.org', isDonor: true, country: 'BD', district: 'Dhaka', bloodGroup: 'O+', publicMapConsent: false, acceptedTerms: true, acceptedPrivacy: true, donations: 0 },
          other: { uid: 'other', email: 'other@example.org', isDonor: false, country: 'BD', district: 'Dhaka', bloodGroup: 'A+', acceptedTerms: true, acceptedPrivacy: true, donations: 0 },
        },
      });
    });

    const guest = environment.unauthenticatedContext().database();
    const donor = environment.authenticatedContext('donor', { email: 'donor@example.org', email_verified: true }).database();
    const unverifiedDonor = environment.authenticatedContext('donor', { email: 'donor@example.org', email_verified: false }).database();
    const other = environment.authenticatedContext('other', { email: 'other@example.org', email_verified: true }).database();
    const listing = { uid: 'donor', country: 'BD', district: 'Dhaka', bloodGroup: 'O+', available: true, publicMapConsent: true };

    await assertSucceeds(guest.ref('donors').once('value'));
    await assertFails(donor.ref('donors/donor').set(listing));
    await assertSucceeds(donor.ref('users/donor').update({ publicMapConsent: true }));
    await assertFails(unverifiedDonor.ref('donors/donor').set(listing));
    await assertFails(other.ref('donors/donor').set(listing));
    await assertFails(donor.ref('donors/other').set({ ...listing, uid: 'other' }));
    await assertFails(donor.ref('donors/donor').set({ ...listing, district: 'Gazipur' }));
    await assertFails(donor.ref('donors/donor').set({ ...listing, bloodGroup: 'A+' }));
    await assertFails(donor.ref('donors/donor').set({ ...listing, phone: '01700000000' }));
    await assertFails(donor.ref('donors/donor').set({ ...listing, lat: 23.8103, lng: 90.4125 }));
    await assertSucceeds(donor.ref('donors/donor').set(listing));
    assert.deepEqual((await guest.ref('donors/donor').once('value')).val(), listing);
    await assertSucceeds(donor.ref().update({ 'donors/donor': null, 'users/donor/publicMapConsent': false }));
    await assertFails(donor.ref('donors/donor').set(listing));
  } finally {
    await environment.cleanup();
  }
});
