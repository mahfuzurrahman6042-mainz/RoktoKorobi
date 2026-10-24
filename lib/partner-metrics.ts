import type { CountryCode } from './countries';

const belongsToCountry = (recordCountry: unknown, country: CountryCode) =>
  country === 'BD'
    ? recordCountry === undefined || recordCountry === null || recordCountry === '' || recordCountry === 'BD'
    : recordCountry === country;

type ReferredProfile = { country?: unknown; role?: string; isDonor?: boolean; donations?: number };
type BloodRequest = { country?: unknown; userId?: string };

export function countPartnerImpact(
  users: Record<string, ReferredProfile> | null,
  requests: Record<string, BloodRequest> | null,
  country: CountryCode = 'BD',
) {
  const referred = Object.entries(users || {}).filter(([, profile]) =>
    profile?.role !== 'partner_admin' && belongsToCountry(profile?.country, country),
  );
  const referredIds = new Set(referred.map(([uid]) => uid));

  return {
    totalStudents: referred.length,
    totalDonors: referred.filter(([, profile]) => profile.isDonor === true).length,
    totalDonations: referred.reduce((sum, [, profile]) => sum + (Number(profile.donations) || 0), 0),
    totalBloodRequests: Object.values(requests || {}).filter(request =>
      request?.userId && referredIds.has(request.userId) && belongsToCountry(request.country, country),
    ).length,
  };
}
