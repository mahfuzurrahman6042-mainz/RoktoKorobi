'use client';

import Link from 'next/link';
import { enrollmentOpen, localCountryTesting, type CountryCode } from '@/lib/countries';
import { policyReviewHref } from '@/lib/policy-links';

export default function CountryPolicyConsent({ country, terms, privacy, onTerms, onPrivacy }: {
  country: CountryCode; terms: boolean; privacy: boolean;
  onTerms: (value: boolean) => void; onPrivacy: (value: boolean) => void;
}) {
  if (country === 'BD') return null;
  return <fieldset className="space-y-3 rounded-xl border border-[#C0152A]/20 bg-[#F5EDD8] p-4 text-sm">
    <legend className="font-semibold">{country === 'IN' ? 'India' : 'Pakistan'} policies</legend>
    {localCountryTesting() && <p>Local demo only. Test acceptance is stored in the demo database, not live.</p>}
    <label className="flex items-start gap-3"><input required disabled={!enrollmentOpen(country)} type="checkbox" checked={terms} onChange={event => onTerms(event.target.checked)} /><span>I accept the <Link className="underline" target="_blank" href={policyReviewHref(country, 'terms')!}>Terms and Conditions</Link>.</span></label>
    <label className="flex items-start gap-3"><input required disabled={!enrollmentOpen(country)} type="checkbox" checked={privacy} onChange={event => onPrivacy(event.target.checked)} /><span>I accept the <Link className="underline" target="_blank" href={policyReviewHref(country, 'privacy')!}>Privacy Policy</Link>.</span></label>
  </fieldset>;
}
