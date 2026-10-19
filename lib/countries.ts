export type CountryCode = 'BD' | 'IN' | 'PK';

export const COUNTRIES: ReadonlyArray<{ code: CountryCode; name: string; callingCode: string }> = [
  { code: 'BD', name: 'Bangladesh', callingCode: '+880' },
  { code: 'IN', name: 'India', callingCode: '+91' },
  { code: 'PK', name: 'Pakistan', callingCode: '+92' },
];

// Existing accounts have no country field and belong to the Bangladesh pilot.
export function countryForRecord(value: unknown): CountryCode {
  return value === 'IN' || value === 'PK' ? value : 'BD';
}

// Clinical guidance, consent documents and local response partners must be
// approved before enabling a new country's public enrollment.
export function enrollmentOpen(country: CountryCode): boolean {
  return country === 'BD';
}

export function validPhoneForCountry(phone: string, country: CountryCode): boolean {
  const digits = phone.replace(/[\s()-]/g, '');
  if (country === 'BD') return /^(?:\+880|0)?1[3-9]\d{8}$/.test(digits);
  if (country === 'IN') return /^(?:\+91)?[6-9]\d{9}$/.test(digits);
  return /^(?:\+92|0)?3\d{9}$/.test(digits);
}
