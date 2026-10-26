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
          leader: { uid: 'leader', email: 'leader@example.org', country: 'BD', acceptedTerms: true, acceptedPrivacy: true, donations: 0 },
          donor: { uid: 'donor', email: 'donor@example.org', country: 'BD', acceptedTerms: true, acceptedPrivacy: true, donations: 0 },
          indiaLeader: { uid: 'indiaLeader', email: 'india@example.org', country: 'IN', acceptedTerms: true, acceptedPrivacy: true, donations: 0 },
          indiaDonor: { uid: 'indiaDonor', email: 'india-donor@example.org', country: 'IN', isDonor: true, publicMapConsent: true, district: 'Delhi', areaId: '1273294', bloodGroup: 'O+', acceptedTerms: true, acceptedPrivacy: true, donations: 0 },
          pakistanLeader: { uid: 'pakistanLeader', email: 'pakistan@example.org', country: 'PK', acceptedTerms: true, acceptedPrivacy: true, donations: 0 },
          pakistanDonor: { uid: 'pakistanDonor', email: 'pakistan-donor@example.org', country: 'PK', isDonor: true, publicMapConsent: true, district: 'Lahore', areaId: '1172451', bloodGroup: 'A+', acceptedTerms: true, acceptedPrivacy: true, donations: 0 },
        },
        bloodRequests: { req1: { userId: 'leader', patientName: 'Private patient', contact: 'private' } },
        countryData: {
          IN: { bloodRequests: { in1: { userId: 'indiaLeader', country: 'IN', status: 'pending', patientName: 'India patient' } } },
          PK: { bloodRequests: { pk1: { userId: 'pakistanLeader', country: 'PK', status: 'pending', patientName: 'Pakistan patient' } } },
        },
        testimonials: {
          approved: { name: 'Public story', story: 'Shared', rating: 5, approved: true },
          pending: { name: 'Private story', story: 'Pending', rating: 5, approved: false, email: 'private@example.org' },
        },
        publicTestimonials: { approved: { name: 'Public story', story: 'Shared', rating: 5, approved: true } },
        partnerInstitutes: {
          p1: { name: 'Leader organization', country: 'BD', adminUserId: 'leader' },
          p2: { name: 'Other organization', country: 'BD', adminUserId: 'donor' },
          indiaPartner: { name: 'India organization', country: 'IN', adminUserId: 'indiaLeader', status: 'approved', referralCode: 'INPRIVATE1' },
        },
        partnerInvites: {
          INPRIVATE1: { name: 'India organization', country: 'IN', instituteId: 'indiaPartner', active: true },
          ININACTIVE: { name: 'India organization', country: 'IN', instituteId: 'indiaPartner', active: false },
        },
        notifications: { leader: { n1: { id: 'n1', message: 'Hello', read: false } } },
      });
    });

    const guest = environment.unauthenticatedContext().database();
    const owner = environment.authenticatedContext('owner', { email: 'owner@example.org', email_verified: true }).database();
    const leader = environment.authenticatedContext('leader', { email: 'leader@example.org', email_verified: true }).database();
    const donor = environment.authenticatedContext('donor', { email: 'donor@example.org', email_verified: true }).database();
    const indiaLeader = environment.authenticatedContext('indiaLeader', { email: 'india@example.org', email_verified: true }).database();
    const indiaDonor = environment.authenticatedContext('indiaDonor', { email: 'india-donor@example.org', email_verified: true }).database();
    const pakistanLeader = environment.authenticatedContext('pakistanLeader', { email: 'pakistan@example.org', email_verified: true }).database();
    const pakistanDonor = environment.authenticatedContext('pakistanDonor', { email: 'pakistan-donor@example.org', email_verified: true }).database();
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
    await assertFails(leader.ref('users/leader').update({ country: 'IN' }));
    await assertFails(guest.ref('partnerInvites/INPRIVATE1').once('value'));
    await assertFails(leader.ref('partnerInvites/INPRIVATE1').once('value'));
    await assertSucceeds(indiaLeader.ref('partnerInvites/INPRIVATE1').once('value'));
    await assertFails(indiaLeader.ref('donors').once('value'));
    await assertFails(indiaLeader.ref('hospitals').once('value'));
    await assertFails(indiaLeader.ref('organizations').once('value'));
    await assertFails(indiaLeader.ref('bloodRequests').once('value'));
    await assertFails(indiaLeader.ref('publicStats').once('value'));
    await assertFails(indiaLeader.ref('countryData/IN/bloodRequests').once('value'));
    await assertSucceeds(owner.ref('countryData/IN/bloodRequests').once('value'));
    const foreignSignup = environment.authenticatedContext('foreignSignup', { email: 'foreign@example.org', email_verified: false }).database();
    const foreignProfile = { uid: 'foreignSignup', email: 'foreign@example.org', country: 'IN', name: 'Foreign Signup', donations: 0, acceptedTerms: true, acceptedPrivacy: true };
    await assertFails(foreignSignup.ref('users/foreignSignup').set(foreignProfile));
    await assertSucceeds(owner.ref('settings/countryLaunch/IN').set(true));
    await assertSucceeds(owner.ref('settings/countryLaunch/PK').set(true));
    const newPakistanLeader = environment.authenticatedContext('newPakistanLeader', { email: 'new-pakistan-leader@example.org', email_verified: false }).database();
    await assertSucceeds(newPakistanLeader.ref('users/newPakistanLeader').update({
      uid: 'newPakistanLeader', email: 'new-pakistan-leader@example.org', name: 'Pakistan Leader',
      phone: '+92 300 1234567', city: 'Lahore', country: 'PK', isDonor: false, donations: 0,
      acceptedTerms: true, acceptedPrivacy: true,
      consentVersion: 'PK-PRIV-1.0+PK-TERMS-1.0',
      consentedAt: '2026-10-26T00:00:00.000Z', createdAt: '2026-10-26T00:00:00.000Z', updatedAt: '2026-10-26T00:00:00.000Z',
    }));
    const publicInvite = await assertSucceeds(guest.ref('partnerInvites/INPRIVATE1').once('value'));
    assert.deepEqual(publicInvite.val(), { name: 'India organization', country: 'IN', instituteId: 'indiaPartner', active: true });
    await assertFails(guest.ref('partnerInvites/ININACTIVE').once('value'));
    await assertFails(guest.ref('partnerInvites').once('value'));
    await assertFails(guest.ref('partnerInstitutes/indiaPartner').once('value'));
    await assertFails(owner.ref('partnerInvites/INPRIVATE1').update({ privatePhone: '0000000000' }));
    await assertSucceeds(foreignSignup.ref('users/foreignSignup').set(foreignProfile));
    await assertFails(foreignSignup.ref('users/foreignSignup').update({ country: 'PK' }));
    const indiaStudent = environment.authenticatedContext('indiaStudent', { email: 'india-student@example.org', email_verified: false }).database();
    await assertSucceeds(indiaStudent.ref('users/indiaStudent').set({
      uid: 'indiaStudent', email: 'india-student@example.org', name: 'India Student', country: 'IN', donations: 0,
      acceptedTerms: true, acceptedPrivacy: true, instituteId: 'indiaPartner', referralCode: 'INPRIVATE1',
    }));
    await assertFails(indiaStudent.ref('users/indiaStudent').update({ isDonor: true, age: 18, dateOfBirth: '2000-01-01' }));
    const newIndiaDonor = environment.authenticatedContext('newIndiaDonor', { email: 'new-india-donor@example.org', email_verified: false }).database();
    const newIndiaDonorProfile = {
      uid: 'newIndiaDonor', email: 'new-india-donor@example.org', country: 'IN', donations: 0,
      acceptedTerms: true, acceptedPrivacy: true, isDonor: true, dateOfBirth: '2000-01-01', age: 18,
    };
    await assertFails(newIndiaDonor.ref('users/newIndiaDonor').set({ ...newIndiaDonorProfile, age: 17 }));
    await assertSucceeds(newIndiaDonor.ref('users/newIndiaDonor').set(newIndiaDonorProfile));
    await assertFails(indiaStudent.ref('users/indiaStudent').update({ country: 'BD' }));
    await assertSucceeds(indiaStudent.ref('partnerMembers/indiaPartner/indiaStudent').set({
      uid: 'indiaStudent', name: 'India Student', joinedAt: '2026-10-20T00:00:00Z', consent: true,
    }));
    await assertSucceeds(indiaLeader.ref('partnerMembers/indiaPartner').once('value'));
    await assertFails(leader.ref('partnerMembers/indiaPartner').once('value'));
    await assertFails(pakistanLeader.ref('partnerMembers/indiaPartner').once('value'));
    await assertFails(guest.ref('partnerMembers/indiaPartner').once('value'));
    const countryStats = { users: 2, donors: 1, requestsFulfilled: 0, partners: 1, updatedAt: Date.now() };
    await assertSucceeds(owner.ref('countryData/IN/publicStats').set(countryStats));
    await assertSucceeds(indiaLeader.ref('countryData/IN/publicStats').once('value'));
    await assertFails(leader.ref('countryData/IN/publicStats').once('value'));
    await assertFails(pakistanLeader.ref('countryData/IN/publicStats').once('value'));
    await assertFails(guest.ref('countryData/IN/publicStats').once('value'));
    await assertFails(indiaLeader.ref('countryData/IN/publicStats').set(countryStats));
    await assertFails(owner.ref('countryData/PK/publicStats').set({ ...countryStats, donors: -1 }));
    await assertFails(indiaLeader.ref('countryData/IN/bloodRequests').once('value'));
    await assertFails(pakistanLeader.ref('countryData/PK/bloodRequests').once('value'));
    await assertSucceeds(indiaLeader.ref('countryData/IN/bloodRequests').orderByChild('userId').equalTo('indiaLeader').once('value'));
    await assertSucceeds(pakistanLeader.ref('countryData/PK/bloodRequests').orderByChild('userId').equalTo('pakistanLeader').once('value'));
    await assertFails(indiaDonor.ref('countryData/IN/bloodRequests/in1').once('value'));
    await assertSucceeds(indiaLeader.ref('countryData/IN/bloodRequests/in1').once('value'));
    await assertFails(indiaDonor.ref('countryData/IN/bloodRequests').orderByChild('userId').equalTo('indiaLeader').once('value'));
    const pendingMessage = { senderId: 'indiaDonor', receiverId: 'indiaLeader', requestId: 'in1', content: 'Can help', timestamp: '2026-10-20T00:00:00Z', read: false };
    await assertFails(indiaDonor.ref('countryData/IN/messages/in1/m1').set(pendingMessage));
    await assertFails(guest.ref('countryData/IN/bloodRequests').once('value'));
    await assertFails(leader.ref('countryData/IN/bloodRequests').once('value'));
    await assertFails(indiaLeader.ref('countryData/PK/bloodRequests').once('value'));
    await assertFails(pakistanLeader.ref('countryData/IN/bloodRequests').once('value'));
    await assertFails(indiaLeader.ref('countryData/PK/donors').once('value'));
    await assertFails(indiaLeader.ref('countryData/PK/hospitals').once('value'));
    await assertFails(indiaLeader.ref('countryData/PK/bloodRequests/new').set({ userId: 'indiaLeader', country: 'PK' }));
    await assertFails(indiaLeader.ref('countryData/IN/bloodRequests/forgedApproval').set({ userId: 'indiaLeader', country: 'IN', status: 'approved', fulfilled: false }));
    await assertFails(indiaLeader.ref('countryData/IN/bloodRequests/noStatus').set({ userId: 'indiaLeader', country: 'IN' }));
    await assertSucceeds(indiaLeader.ref('countryData/IN/bloodRequests/new').set({ userId: 'indiaLeader', country: 'IN', status: 'pending', fulfilled: false }));
    await assertFails(indiaLeader.ref('countryData/IN/bloodRequests/new').update({ status: 'approved' }));
    await assertSucceeds(owner.ref('countryData/IN/bloodRequests/new').update({ status: 'approved' }));
    await assertSucceeds(indiaDonor.ref('countryData/IN/bloodRequests/new').once('value'));
    const approved = await assertSucceeds(indiaDonor.ref('countryData/IN/bloodRequests').orderByChild('status').equalTo('approved').once('value'));
    assert.deepEqual(Object.keys(approved.val()), ['new']);
    await assertFails(indiaLeader.ref('countryData/IN/bloodRequests/new').update({ status: 'open' }));
    await assertFails(indiaLeader.ref('countryData/IN/bloodRequests/new').update({ country: 'PK' }));
    const indiaMessage = { senderId: 'indiaDonor', receiverId: 'indiaLeader', requestId: 'new', content: 'Can help', timestamp: '2026-10-20T00:00:00Z', read: false };
    await assertSucceeds(indiaDonor.ref('countryData/IN/messages/new/m1').set(indiaMessage));
    await assertFails(indiaDonor.ref('countryData/IN/messages/new').once('value'));
    await assertSucceeds(indiaDonor.ref('countryData/IN/messages/new').orderByChild('senderId').equalTo('indiaDonor').once('value'));
    await assertSucceeds(indiaLeader.ref('countryData/IN/messages/new').orderByChild('receiverId').equalTo('indiaLeader').once('value'));
    await assertFails(pakistanLeader.ref('countryData/IN/messages/new/m1').once('value'));
    await assertFails(leader.ref('countryData/IN/messages/new/m1').once('value'));
    await assertFails(pakistanLeader.ref('countryData/IN/messages/new/m2').set({ ...indiaMessage, senderId: 'pakistanLeader' }));
    await assertFails(indiaDonor.ref('countryData/PK/messages/new/m2').set(indiaMessage));
    await assertFails(indiaDonor.ref('countryData/IN/messages/new/m1/read').set(true));
    await assertSucceeds(indiaLeader.ref('countryData/IN/messages/new/m1/read').set(true));
    await assertSucceeds(indiaLeader.ref('countryData/IN/bloodRequests/new').update({ status: 'fulfilled', fulfilled: true }));
    await assertFails(indiaDonor.ref('countryData/IN/messages/new/afterClosure').set(indiaMessage));
    const indiaMarker = { uid: 'indiaDonor', country: 'IN', district: 'Delhi', areaId: '1273294', bloodGroup: 'O+', available: true, publicMapConsent: true };
    await assertFails(indiaDonor.ref('countryData/PK/donors/indiaDonor').set({ ...indiaMarker, country: 'PK' }));
    await assertFails(indiaDonor.ref('countryData/IN/donors/indiaDonor').set({ ...indiaMarker, areaId: '1172451' }));
    await assertFails(indiaDonor.ref('countryData/IN/donors/indiaDonor').set({ ...indiaMarker, district: 'Mumbai' }));
    await assertFails(indiaDonor.ref('countryData/IN/donors/indiaDonor').set({ ...indiaMarker, publicMapConsent: false }));
    await assertSucceeds(indiaDonor.ref('countryData/IN/donors/indiaDonor').set(indiaMarker));
    const pakistanMarker = { uid: 'pakistanDonor', country: 'PK', district: 'Lahore', areaId: '1172451', bloodGroup: 'A+', available: true, publicMapConsent: true };
    await assertFails(pakistanDonor.ref('countryData/IN/donors/pakistanDonor').set({ ...pakistanMarker, country: 'IN' }));
    await assertSucceeds(pakistanDonor.ref('countryData/PK/donors/pakistanDonor').set(pakistanMarker));
    await assertFails(indiaLeader.ref('partnerInstitutes/p1').once('value'));
    await assertFails(leader.ref('partnerInstitutes/indiaPartner').once('value'));
    await assertFails(leader.ref('partnerMembers/indiaPartner').once('value'));
    await assertFails(leader.ref('partnerStats/indiaPartner').once('value'));
    await assertSucceeds(leader.ref('users/leader').update({ donations: 1, lastDonationDate: '2026-10-17T00:00:00Z' }));
    await assertSucceeds(owner.ref('users').once('value'));
    await assertSucceeds(guest.ref('publicStats').once('value'));
    await assertFails(guest.ref('publicStats').set({ users: 99, donors: 99, requestsFulfilled: 99, partners: 99, updatedAt: Date.now() }));
    await assertFails(leader.ref('publicStats').set({ users: 99, donors: 99, requestsFulfilled: 99, partners: 99, updatedAt: Date.now() }));
    await assertFails(owner.ref('publicStats').set({ users: -1, donors: 1, requestsFulfilled: 0, partners: 0, updatedAt: Date.now() }));
    await assertSucceeds(owner.ref('publicStats').set({ users: 2, donors: 1, requestsFulfilled: 0, partners: 0, updatedAt: Date.now() }));
    await assertSucceeds(guest.ref('publicStats').once('value'));

    const request = { uid: 'leader', email: 'leader@example.org', country: 'BD', organizationName: 'Korobi Club', organizationType: 'ngo', district: 'Dhaka', city: 'Dhaka', contactPhone: '0123456789', message: '', status: 'pending', createdAt: Date.now() };
    await assertFails(unverified.ref('partnerApplications/unverified').set({ ...request, uid: 'unverified', email: 'unverified@example.org' }));
    await assertFails(leader.ref('partnerApplications/leader').set({ ...request, country: 'IN' }));
    const { city: omittedCity, ...requestWithoutCity } = request;
    await assertFails(leader.ref('partnerApplications/leader').set(requestWithoutCity));
    await assertSucceeds(leader.ref('partnerApplications/leader').set(request));
    await assertSucceeds(leader.ref('partnerApplications/leader').once('value'));
    await assertFails(donor.ref('partnerApplications/leader').once('value'));
    await assertFails(leader.ref('partnerApplications/leader/status').set('approved'));
    await assertFails(leader.ref('partnerApplications/leader').set(request));
    await assertSucceeds(owner.ref().update({
      'partnerInstitutes/newPartner': { name: 'Korobi Club', country: 'BD', adminUserId: 'leader', status: 'approved', referralCode: 'KOROBI01' },
      'partnerInvites/KOROBI01': { name: 'Korobi Club', instituteId: 'newPartner', country: 'BD', active: true },
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
      uid: 'student', email: 'student@example.org', country: 'BD', name: 'Referral Student', donations: 0,
      acceptedTerms: true, acceptedPrivacy: true,
      instituteId: 'newPartner', referralCode: 'KOROBI01',
    }));
    const membership = { uid: 'student', name: 'Referral Student', joinedAt: '2026-10-18T00:00:00.000Z', consent: true };
    await assertSucceeds(student.ref('partnerMembers/newPartner/student').set(membership));
    const roster = await assertSucceeds(leader.ref('partnerMembers/newPartner').once('value'));
    assert.equal(roster.val().student.name, 'Referral Student');
    await assertFails(guest.ref('partnerMembers/newPartner').once('value'));
    await assertFails(donor.ref('partnerMembers/newPartner').once('value'));
    await assertFails(leader.ref('partnerMembers/p2').once('value'));
    await assertFails(student.ref('partnerMembers/p2/student').set(membership));
    await assertFails(student.ref('partnerMembers/newPartner/student/phone').set('01700000000'));
    await assertFails(student.ref('partnerMembers/newPartner/student').set({ ...membership, phone: '01700000000' }));
    await assertFails(donor.ref('partnerMembers/newPartner/student').set(membership));
    await assertFails(student.ref('partnerMembers/newPartner/leader').set(membership));
    await assertFails(student.ref('partnerMembers/newPartner/student').once('value'));
    const verifiedStudent = environment.authenticatedContext('student', { email: 'student@example.org', email_verified: true }).database();
    await assertSucceeds(verifiedStudent.ref('partnerMembers/newPartner/student').once('value'));
    await assertFails(student.ref('partnerMembers/newPartner').once('value'));
    await assertSucceeds(student.ref('partnerMembers/newPartner/student').remove());
    await assert.equal((await leader.ref('partnerMembers/newPartner').once('value')).exists(), false);

    await assertFails(guest.ref('testimonials').once('value'));
    const publicStories = await assertSucceeds(guest.ref('publicTestimonials').once('value'));
    assert.deepEqual(Object.keys(publicStories.val()), ['approved']);
    await assertFails(guest.ref('testimonials/approved').once('value'));
    await assertFails(guest.ref('testimonials/pending').once('value'));
    await assertSucceeds(donor.ref('testimonials/new').set({ name: 'New', story: 'A story', rating: 5, approved: false }));
    await assertFails(donor.ref('testimonials/new/approved').set(true));
    await assertFails(donor.ref('publicTestimonials/new').set({ name: 'Forged', approved: true }));
    await assertSucceeds(donor.ref('bloodRequests/req2').set({ userId: 'donor', country: 'BD', patientName: 'Test', contact: 'private' }));
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

    // Exercise the same consent/withdrawal contract in both new countries.
    for (const [country, memberDb, leaderDb, otherLeaderDb, uid, leaderUid, marker] of [
      ['IN', indiaDonor, indiaLeader, pakistanLeader, 'indiaDonor', 'indiaLeader', indiaMarker],
      ['PK', pakistanDonor, pakistanLeader, indiaLeader, 'pakistanDonor', 'pakistanLeader', pakistanMarker],
    ]) {
      const instituteId = `consent-${country}`;
      const referralCode = `CONSENT${country}`;
      await owner.ref().update({
        [`partnerInstitutes/${instituteId}`]: { name: 'Consent test club', country, status: 'approved', adminUserId: leaderUid, referralCode },
        [`partnerInvites/${referralCode}`]: { name: 'Consent test club', country, instituteId, active: true },
        [`users/${uid}/instituteId`]: instituteId,
        [`users/${uid}/referralCode`]: referralCode,
        [`users/${uid}/name`]: 'Consent Test Donor',
      });
      const memberPath = `partnerMembers/${instituteId}/${uid}`;
      const markerPath = `countryData/${country}/donors/${uid}`;
      const member = { uid, name: 'Consent Test Donor', joinedAt: '2026-10-23T00:00:00Z', consent: true };
      await assertSucceeds(memberDb.ref(memberPath).set(member));
      await assertFails(memberDb.ref(memberPath).update({ email: 'private@example.org' }));
      await assertFails(otherLeaderDb.ref(`partnerMembers/${instituteId}`).once('value'));
      await assertSucceeds(memberDb.ref(memberPath).remove());
      assert.equal((await leaderDb.ref(`partnerMembers/${instituteId}`).once('value')).exists(), false);
      assert.equal((await memberDb.ref(markerPath).once('value')).exists(), true, 'roster withdrawal must not remove the separately chosen map listing');
      await assertSucceeds(memberDb.ref(memberPath).set(member));
      await assertSucceeds(memberDb.ref().update({ [markerPath]: null, [`users/${uid}/publicMapConsent`]: false }));
      assert.equal((await leaderDb.ref(markerPath).once('value')).exists(), false);
      assert.equal((await leaderDb.ref(memberPath).once('value')).exists(), true, 'map withdrawal must not remove the separately chosen roster entry');
      await assertFails(memberDb.ref(markerPath).set(marker));
      await assertSucceeds(owner.ref(`partnerInstitutes/${instituteId}/status`).set('suspended'));
      await assertFails(leaderDb.ref(`partnerMembers/${instituteId}`).once('value'));
      await assertSucceeds(memberDb.ref(memberPath).remove());
    }
  } finally {
    await environment.cleanup();
  }
});
