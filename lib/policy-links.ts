import type { CountryCode } from './countries';

export function policyReviewHref(country: CountryCode, kind: 'privacy' | 'terms'): string | null {
  if (country === 'BD') return kind === 'privacy' ? '/privacy-policy' : '/terms-of-service';
  const slug = country === 'IN' ? 'india' : 'pakistan';
  return `/${slug}/${kind}`;
}

export function policyConsentVersion(country: CountryCode): string {
  if (country === 'IN') return 'IN-PRIV-1.0+IN-TERMS-1.0';
  if (country === 'PK') return 'PK-PRIV-1.0+PK-TERMS-1.0';
  return '2026-10-01';
}
