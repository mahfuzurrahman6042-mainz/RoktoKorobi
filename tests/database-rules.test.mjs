import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';

test('database rules protect partner requests and existing flows', async () => {
  const environment = await initializeTestEnvironment({
    projectId: 'demo-roktokorobi-rules',
    database: { host: '127.0.0.1', port: 9000, rules: readFileSync(new URL('../database.rules.json', import.meta.url), 'utf8') },
  });
  try {
    await environment.withSecurityRulesDisabled(async context => {
      await context.database().ref().set({
        admins: { super_admin: { email: 'owner@example.org', role: 'super_admin' } },
        users: {
          leader: { uid: 'leader', email: 'leader@example.org', acceptedTerms: true, acceptedPrivacy: true, donations: 0 },
          donor: { uid: 'donor', email: 'donor@example.org', acceptedTerms: true, acceptedPrivacy: true, donations: 0 },
        },
        bloodRequests: { req1: { userId: 'leader', patientName: 'Private patient', contact: 'private' } },
        testimonials: {
          approved: { name: 'Public story', story: 'Shared', rating: 5, approved: true },
          pending: { name: 'Private story', story: 'Pending', rating: 5, approved: false, email: 'private@example.org' },
        },
        publicTestimonials: { approved: { name: 'Public story', story: 'Shared', rating: 5, approved: true } },
        partnerInstitutes: {
          p1: { name: 'Leader organization', adminUserId: 'leader' },
          p2: { name: 'Other organization', adminUserId: 'donor' },
        },
        notifications: { leader: { n1: { id: 'n1', message: 'Hello', read: false } } },
      });
    });

    const guest = environment.unauthenticatedContext().database();
    const owner = environment.authenticatedContext('owner', { email: 'owner@example.org', email_verified: true }).database();
    const leader = environment.authenticatedContext('leader', { email: 'leader@example.org', email_verified: true }).database();
    const donor = environment.authenticatedContext('donor', { email: 'donor@example.org', email_verified: true }).database();
    const unverified = environment.authenticatedContext('unverified', { email: 'unverified@example.org', email_verified: false }).database();

    await assertFails(guest.ref().once('value'));
    await assertFails(guest.ref('users').once('value'));
    await assertFails(guest.ref('bloodRequests').once('value'));
    await assertSucceeds(guest.ref('hospitals').once('value'));
    await assertSucceeds(leader.ref('admins/super_admin').once('value'));
    await assertSucceeds(leader.ref('users/leader').once('value'));
    await assertFails(leader.ref('users').once('value'));
    await assertFails(leader.ref('users/donor').once('value'));
    await assertFails(leader.ref('admins/super_admin/email').set('leader@example.org'));
    await assertFails(leader.ref('users/leader').update({ role: 'partner_admin' }));
    await assertSucceeds(leader.ref('users/leader').update({ donations: 1, lastDonationDate: '2026-10-17T00:00:00Z' }));
    await assertSucceeds(owner.ref('users').once('value'));

    const request = { uid: 'leader', email: 'leader@example.org', organizationName: 'Korobi Club', organizationType: 'ngo', district: 'Dhaka', contactPhone: '0123456789', message: '', status: 'pending', createdAt: Date.now() };
    await assertFails(unverified.ref('partnerApplications/unverified').set({ ...request, uid: 'unverified', email: 'unverified@example.org' }));
    await assertSucceeds(leader.ref('partnerApplications/leader').set(request));
    await assertSucceeds(leader.ref('partnerApplications/leader').once('value'));
    await assertFails(donor.ref('partnerApplications/leader').once('value'));
    await assertFails(leader.ref('partnerApplications/leader/status').set('approved'));
    await assertFails(leader.ref('partnerApplications/leader').set(request));
    await assertSucceeds(owner.ref().update({
      'partnerInstitutes/newPartner': { name: 'Korobi Club', adminUserId: 'leader', status: 'approved', referralCode: 'KOROBI01' },
      'partnerInvites/KOROBI01': { name: 'Korobi Club', instituteId: 'newPartner', active: true },
      'users/leader/role': 'partner_admin',
      'users/leader/instituteId': 'newPartner',
      'partnerApplications/leader/status': 'approved',
      'partnerApplications/leader/instituteId': 'newPartner',
      'partnerApplications/leader/reviewedBy': 'owner',
      'partnerApplications/leader/reviewedAt': Date.now(),
    }));
    await assertSucceeds(guest.ref('partnerInvites/KOROBI01').once('value'));
    await assertSucceeds(leader.ref('partnerInstitutes/newPartner').once('value'));
    const student = environment.authenticatedContext('student', { email: 'student@example.org', email_verified: false }).database();
    await assertSucceeds(student.ref('users/student').set({
      uid: 'student', email: 'student@example.org', donations: 0,
      acceptedTerms: true, acceptedPrivacy: true,
      instituteId: 'newPartner', referralCode: 'KOROBI01',
    }));

    await assertFails(guest.ref('testimonials').once('value'));
    const publicStories = await assertSucceeds(guest.ref('publicTestimonials').once('value'));
    assert.deepEqual(Object.keys(publicStories.val()), ['approved']);
    await assertFails(guest.ref('testimonials/approved').once('value'));
    await assertFails(guest.ref('testimonials/pending').once('value'));
    await assertSucceeds(donor.ref('testimonials/new').set({ name: 'New', story: 'A story', rating: 5, approved: false }));
    await assertFails(donor.ref('testimonials/new/approved').set(true));
    await assertFails(donor.ref('publicTestimonials/new').set({ name: 'Forged', approved: true }));
    await assertSucceeds(donor.ref('bloodRequests/req2').set({ userId: 'donor', patientName: 'Test', contact: 'private' }));
    await assertFails(leader.ref('bloodRequests/req2').remove());
    await assertSucceeds(donor.ref('bloodRequests/req2').remove());
    await assertSucceeds(leader.ref('partnerInstitutes/p1').once('value'));
    await assertFails(leader.ref('partnerInstitutes/p2').once('value'));

    await assertSucceeds(donor.ref('messages/req1/m1').set({ senderId: 'donor', receiverId: 'leader', requestId: 'req1', content: 'Can help', timestamp: '2026-10-17T00:00:00Z', read: false }));
    await assertFails(guest.ref('messages/req1').once('value'));
    await assertFails(donor.ref('messages/req1').once('value'));
    await assertSucceeds(donor.ref('messages/req1').orderByChild('senderId').equalTo('donor').once('value'));
    await assertSucceeds(leader.ref('messages/req1').orderByChild('receiverId').equalTo('leader').once('value'));
    await assertFails(donor.ref('messages/req1/m1/read').set(true));
    await assertSucceeds(leader.ref('messages/req1/m1').update({ read: true }));
    await assertSucceeds(leader.ref('notifications/leader/n1').update({ read: true }));
    await assertFails(donor.ref('notifications/leader/n1/read').set(true));
  } finally {
    await environment.cleanup();
  }
});
