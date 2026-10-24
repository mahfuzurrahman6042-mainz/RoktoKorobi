import areas from './data/country-areas.json';
import type { CountryCode } from './countries';

export type CountryArea = { id: string; name: string; region: string; lat: number; lng: number };

const byCountry: Record<'IN' | 'PK', CountryArea[]> = areas;
const byId = {
  IN: new Map(byCountry.IN.map(area => [area.id, area])),
  PK: new Map(byCountry.PK.map(area => [area.id, area])),
};

export function listCountryAreas(country: CountryCode): CountryArea[] {
  return country === 'BD' ? [] : byCountry[country];
}

export function findCountryArea(country: CountryCode, id: string): CountryArea | null {
  return country === 'BD' ? null : byId[country].get(id) || null;
}

export function listCountryRegions(country: CountryCode): string[] {
  return [...new Set(listCountryAreas(country).map(area => area.region))].sort((a, b) => a.localeCompare(b));
}
