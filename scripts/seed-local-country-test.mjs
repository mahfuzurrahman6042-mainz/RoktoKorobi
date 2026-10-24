// Only the loopback Firebase emulators are addressed. Never accepts a live URL.
import { createRequire } from 'node:module';
process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
process.env.FIREBASE_DATABASE_EMULATOR_HOST = '127.0.0.1:9000';
const require = createRequire(new URL('../functions/package.json', import.meta.url));
const admin = require('firebase-admin');
const projectId = 'demo-roktokorobi-rules';
const app = admin.initializeApp({ projectId, databaseURL: `https://${projectId}-default-rtdb.firebaseio.com` }, 'local-country-seed');
const auth = app.auth();
const db = app.database();
const now = new Date().toISOString();
const password = 'Local-Only-2026!';
const accounts = [
  { uid: 'test-owner', email: 'owner@example.test', name: 'Local Super Admin', country: 'BD' },
  { uid: 'test-india-leader', email: 'india-leader@example.test', name: 'India Demo Leader', country: 'IN', instituteId: 'test-india-partner', referralCode: 'TESTINDIA01' },
  { uid: 'test-pakistan-leader', email: 'pakistan-leader@example.test', name: 'Pakistan Demo Leader', country: 'PK', instituteId: 'test-pakistan-partner', referralCode: 'TESTPAK01' },
  { uid: 'test-india-student', email: 'india-student@example.test', name: 'India Demo Student', country: 'IN', instituteId: 'test-india-partner', referralCode: 'TESTINDIA01', isDonor: true },
  { uid: 'test-pakistan-student', email: 'pakistan-student@example.test', name: 'Pakistan Demo Student', country: 'PK', instituteId: 'test-pakistan-partner', referralCode: 'TESTPAK01', isDonor: true },
];
try {
  const changes = { 'admins/super_admin': { email: 'owner@example.test', role: 'super_admin' },
    publicStats: { users: 1, donors: 0, partners: 0, requestsFulfilled: 0, updatedAt: Date.now() },
    'settings/countryLaunch/IN': true, 'settings/countryLaunch/PK': true,
    'settings/countryNotifications/IN': false, 'settings/countryNotifications/PK': false };
  for (const account of accounts) {
    const properties = { email: account.email, password, displayName: account.name, emailVerified: true };
    try { await auth.updateUser(account.uid, properties); }
    catch (error) { if (error.code !== 'auth/user-not-found') throw error; await auth.createUser({ uid: account.uid, ...properties }); }
    const india = account.country === 'IN';
    const city = india ? 'Delhi' : account.country === 'PK' ? 'Lahore' : 'Dhaka';
    const profile = { ...account, city, district: city, phone: india ? '+919000000001' : account.country === 'PK' ? '+923000000001' : '+8801700000001',
      donations: 0, isDonor: account.isDonor === true, acceptedTerms: true, acceptedPrivacy: true,
      consentVersion: 'LOCAL-TEST-ONLY', consentedAt: now, adultConfirmedAt: now, createdAt: now, updatedAt: now };
    if (account.instituteId && !account.isDonor) profile.role = 'partner_admin';
    if (account.uid === 'test-owner') profile.role = 'super_admin';
    if (account.isDonor) Object.assign(profile, { areaId: india ? '1273294' : '1172451', bloodGroup: india ? 'O+' : 'A+', publicMapConsent: true, availability: true });
    changes[`users/${account.uid}`] = profile;
    if (account.instituteId && !account.isDonor) {
      const name = `${india ? 'India' : 'Pakistan'} Demo Club`;
      changes[`partnerInstitutes/${account.instituteId}`] = { name, country: account.country, type: 'college', status: 'approved', adminUserId: account.uid, referralCode: account.referralCode, district: city };
      changes[`partnerInvites/${account.referralCode}`] = { name, country: account.country, instituteId: account.instituteId, active: true };
      changes[`partnerStats/${account.instituteId}`] = { totalStudents: 1, totalDonors: 1, totalDonations: 0, totalBloodRequests: 0, updatedAt: now };
    }
    if (account.isDonor) {
      changes[`partnerMembers/${account.instituteId}/${account.uid}`] = { uid: account.uid, name: account.name, joinedAt: now, consent: true };
      changes[`countryData/${account.country}/donors/${account.uid}`] = { uid: account.uid, country: account.country, district: city, areaId: profile.areaId, bloodGroup: profile.bloodGroup, available: true, publicMapConsent: true };
    }
  }
  for (const country of ['IN', 'PK']) {
    const uid = country === 'IN' ? 'test-india-leader' : 'test-pakistan-leader';
    changes[`countryData/${country}/publicStats`] = { users: 2, donors: 1, partners: 1, requestsFulfilled: 0, updatedAt: Date.now() };
    for (const status of ['pending', 'approved']) changes[`countryData/${country}/bloodRequests/test-${status}`] = {
      userId: uid, country, status, fulfilled: false, patientName: `DEMO ONLY — ${status} request`, contact: '0000000000',
      bloodType: 'O+', hospital: 'Demo facility — not a real request', location: country === 'IN' ? 'Delhi' : 'Lahore',
      message: 'Synthetic local test. Do not contact anyone or arrange a donation.', unitsNeeded: '1', urgency: 'low', timestamp: now,
    };
  }
  await db.ref().update(changes);
  console.log('Seeded local demo accounts only. Password for every account:', password);
  for (const account of accounts) console.log(account.email, account.country);
} finally { await app.delete(); }
