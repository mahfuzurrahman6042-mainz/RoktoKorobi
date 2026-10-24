import { recordBelongsToCountry, type CountryCode } from './countries.ts';

type RecordValue = Record<string, unknown>;

const values = (input: unknown): RecordValue[] =>
  input && typeof input === 'object'
    ? Object.values(input).filter((value): value is RecordValue => !!value && typeof value === 'object')
    : [];

export function countCountryPublicStats(
  country: CountryCode,
  users: unknown,
  partners: unknown,
  requests: unknown,
  updatedAt: number = Date.now(),
) {
  const scopedUsers = values(users).filter(value => recordBelongsToCountry(value, country));
  const scopedRequests = values(requests).filter(value => recordBelongsToCountry(value, country));
  return {
    users: scopedUsers.length,
    donors: scopedUsers.filter(value => value.isDonor === true && value.availability !== false).length,
    requestsFulfilled: scopedRequests.filter(value => value.fulfilled === true || value.status === 'fulfilled' || value.status === 'completed').length,
    partners: values(partners).filter(value => recordBelongsToCountry(value, country) && value.status === 'approved').length,
    updatedAt,
  };
}
