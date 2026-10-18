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
