import { test } from 'node:test';
import assert from 'node:assert/strict';
import { countPartnerImpact } from '../lib/partner-metrics.ts';

test('counts only activity from referred accounts, not the leader or other organizations', () => {
  const result = countPartnerImpact({
    leader: { role: 'partner_admin', isDonor: true, donations: 9 },
    alice: { isDonor: true, donations: 2 },
    bob: { isDonor: false, donations: 0 },
  }, {
    first: { userId: 'alice' },
    second: { userId: 'alice' },
    leaderRequest: { userId: 'leader' },
    unrelated: { userId: 'someone-else' },
  });

  assert.deepEqual(result, { totalStudents: 2, totalDonors: 1, totalDonations: 2, totalBloodRequests: 2 });
});

test('empty datasets show zero totals', () => {
  assert.deepEqual(countPartnerImpact(null, null), {
    totalStudents: 0, totalDonors: 0, totalDonations: 0, totalBloodRequests: 0,
  });
});

test('country totals exclude another country, including legacy Bangladesh records', () => {
  const users = {
    legacy: { isDonor: true, donations: 5 },
    india: { country: 'IN', isDonor: true, donations: 2 },
    pakistan: { country: 'PK', isDonor: false, donations: 0 },
  };
  const requests = {
    legacy: { userId: 'legacy' },
    india: { userId: 'india', country: 'IN' },
    mislabeled: { userId: 'india', country: 'PK' },
    pakistan: { userId: 'pakistan', country: 'PK' },
  };
  assert.deepEqual(countPartnerImpact(users, requests, 'IN'), {
    totalStudents: 1, totalDonors: 1, totalDonations: 2, totalBloodRequests: 1,
  });
  assert.deepEqual(countPartnerImpact(users, requests, 'PK'), {
    totalStudents: 1, totalDonors: 0, totalDonations: 0, totalBloodRequests: 1,
  });
});
