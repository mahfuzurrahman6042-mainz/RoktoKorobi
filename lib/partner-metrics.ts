type ReferredProfile = { role?: string; isDonor?: boolean; donations?: number };
type BloodRequest = { userId?: string };

export function countPartnerImpact(
  users: Record<string, ReferredProfile> | null,
  requests: Record<string, BloodRequest> | null,
) {
  const referred = Object.entries(users || {}).filter(([, profile]) => profile?.role !== 'partner_admin');
  const referredIds = new Set(referred.map(([uid]) => uid));

  return {
    totalStudents: referred.length,
    totalDonors: referred.filter(([, profile]) => profile.isDonor === true).length,
    totalDonations: referred.reduce((sum, [, profile]) => sum + (Number(profile.donations) || 0), 0),
    totalBloodRequests: Object.values(requests || {}).filter(request => request?.userId && referredIds.has(request.userId)).length,
  };
}
