import { notFound } from 'next/navigation';
import { localCountryTesting } from '@/lib/countries';

export const dynamic = 'force-dynamic';

export default async function LocalTestingPage() {
  if (!localCountryTesting()) notFound();
  let links: Array<{ email: string; oobLink?: string; requestType?: string }> = [];
  try {
    const response = await fetch('http://127.0.0.1:9099/emulator/v1/projects/demo-roktokorobi-rules/oobCodes', { cache: 'no-store' });
    if (response.ok) links = (await response.json()).oobCodes || [];
  } catch { /* The page also explains how to start the emulator. */ }
  return <main className="min-h-screen bg-[#F6EEDD] p-6 text-[#2A1A14] sm:p-10">
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="font-serif text-3xl">India & Pakistan — local test workspace</h1>
      <p>This is a separate demo database. No live accounts, real messages, or real patient requests are involved. Production enrollment is unchanged.</p>
      <section className="rounded-2xl border border-[#E4D6BE] bg-[#FDF9F3] p-6">
        <h2 className="font-serif text-2xl">Test accounts</h2>
        <p className="my-3">All accounts use password <code>Local-Only-2026!</code> and have verified test emails.</p>
        <ul className="list-inside list-disc space-y-2">
          <li>Super admin: owner@example.test</li><li>India leader: india-leader@example.test</li><li>Pakistan leader: pakistan-leader@example.test</li>
          <li>India donor: india-student@example.test</li><li>Pakistan donor: pakistan-student@example.test</li>
        </ul>
        <a className="mt-4 inline-block rounded-xl bg-[#B8132A] px-5 py-3 text-white" href="/login">Open sign in</a>
      </section>
      <section className="rounded-2xl border border-[#E4D6BE] bg-[#FDF9F3] p-6">
        <h2 className="font-serif text-2xl">Flows to test</h2>
        <ul className="my-3 list-inside list-disc space-y-3">
          <li><a className="underline" href="/partner-account">Create a leader account</a>, verify below, and submit a partner request.</li>
          <li>Sign in as the super admin to approve that organization.</li>
          <li>Sign in as its leader and open <a className="underline" href="/dashboard/partner">the partner dashboard</a>.</li>
          <li><a className="underline" href="/register?ref=TESTINDIA01&country=IN">India referral registration</a> · <a className="underline" href="/register?ref=TESTPAK01&country=PK">Pakistan referral registration</a></li>
          <li>Use separate browsers for leader and student. Check roster consent, search, map consent, withdrawal and pending request privacy.</li>
        </ul>
        <p>No push/email delivery or storage-upload service is emulated. Verification messages appear below instead of being sent. Sample counts are seed data; use the super-admin refresh controls when testing counts.</p>
      </section>
      <section className="rounded-2xl border border-[#E4D6BE] bg-[#FDF9F3] p-6">
        <h2 className="font-serif text-2xl">Local verification messages</h2>
        <p className="my-3">After registering, refresh this page and open the newest verification link, then return to the app's email verification page.</p>
        {links.length ? <ul className="space-y-2">{links.slice().reverse().map((item, index) => <li key={index}>{item.email} — {item.oobLink ? <a className="underline" href={item.oobLink} target="_blank" rel="noreferrer">{item.requestType || 'Verify email'}</a> : 'No action link'}</li>)}</ul> : <p>No verification messages yet. If signup fails, check that the emulators are running.</p>}
      </section>
    </div>
  </main>;
}
