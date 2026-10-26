export type CountryCode = 'BD' | 'IN' | 'PK';

// Explicit local-only mode uses a demo Firebase project, never live records.
export function localCountryTesting(): boolean {
  return process.env.NODE_ENV === 'development'
    && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true';
}

export const COUNTRIES: ReadonlyArray<{ code: CountryCode; name: string; callingCode: string }> = [
  { code: 'BD', name: 'Bangladesh', callingCode: '+880' },
  { code: 'IN', name: 'India', callingCode: '+91' },
  { code: 'PK', name: 'Pakistan', callingCode: '+92' },
];

// India and Pakistan centres are derived from the GeoNames cities5000 extract.
export const COUNTRY_MAP_VIEWPORTS: Record<CountryCode, { center: { lat: number; lng: number }; zoom: number }> = {
  BD: { center: { lat: 23.685, lng: 90.3563 }, zoom: 7 },
  IN: { center: { lat: 20.783, lng: 82.818 }, zoom: 4 },
  PK: { center: { lat: 30.341, lng: 68.873 }, zoom: 5 },
};

// Records created before country selection belong to the Bangladesh pilot.
// An explicitly invalid country must not silently become Bangladesh data.
export function countryForRecord(value: unknown): CountryCode | null {
  if (value === undefined || value === null || value === '') return 'BD';
  return value === 'BD' || value === 'IN' || value === 'PK' ? value : null;
}

export function recordBelongsToCountry(
  record: { country?: unknown } | null | undefined,
  country: CountryCode,
): boolean {
  return !!record && countryForRecord(record.country) === country;
}

export type CountryCollection = 'donors' | 'hospitals' | 'bloodRequests' | 'messages';

// Keep existing Bangladesh records in place. New countries never share a
// collection with legacy records, so rules can enforce the boundary at path level.
export function countryDataPath(country: CountryCode, collection: CountryCollection): string {
  return country === 'BD' ? collection : `countryData/${country}/${collection}`;
}

// Country enrollment is enabled in the deployed app only by an explicit
// build-time list. The local emulator mode is separate from live data.
export function enrollmentOpen(country: CountryCode): boolean {
  return country === 'BD' || localCountryTesting()
    || (process.env.NEXT_PUBLIC_ENABLED_COUNTRIES ?? '').split(',').map(value => value.trim().toUpperCase()).includes(country);
}

export function partnerEnrollmentOpen(country: CountryCode): boolean {
  return enrollmentOpen(country);
}

export function validPhoneForCountry(phone: string, country: CountryCode): boolean {
  const digits = phone.trim().replace(/[\s().-]/g, '');
  if (country === 'BD') return /^(?:\+880|0)?1[3-9]\d{8}$/.test(digits);
  if (country === 'IN') return /^(?:\+91)?[6-9]\d{9}$/.test(digits);
  // Pakistani mobile numbers are commonly entered as 03..., +923..., 923...
  // or 00923...; all represent the same national number.
  return /^(?:\+92|0092|92|0)?3\d{9}$/.test(digits);
}
