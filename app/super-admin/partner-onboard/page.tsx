'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { equalTo, orderByChild, query } from 'firebase/database';
import { database, get, getCurrentUser, isSuperAdmin, onAuthStateChange, push, ref, update } from '@/lib/firebase';
import { countPartnerImpact } from '@/lib/partner-metrics';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function newInviteCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(10));
  return Array.from(bytes, value => ALPHABET[value % ALPHABET.length]).join('');
}

export default function PartnerOnboardPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);
  const [name, setName] = useState('');
  const [type, setType] = useState('ngo');
  const [district, setDistrict] = useState('');
  const [leaderEmail, setLeaderEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [partners, setPartners] = useState<Array<{ id: string; name: string }>>([]);
  const [syncId, setSyncId] = useState('');
  const [syncBusy, setSyncBusy] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [applicationUid, setApplicationUid] = useState('');

  useEffect(() => onAuthStateChange(async user => {
    if (!user) { router.replace('/login'); return; }
    if (!user.emailVerified) { router.replace('/verify-email'); return; }
    try {
      if (!database) throw new Error('Database unavailable');
      // The database rules additionally require the trusted super-admin UID.
      const admin = await get(ref(database, 'admins/super_admin'));
      if (admin.val()?.email !== user.email) throw new Error('Access denied');
      setAuthorized(true);
      const partnerSnapshot = await get(ref(database, 'partnerInstitutes'));
      const partnerRecords = partnerSnapshot.val() || {};
      setPartners(Object.entries(partnerRecords).map(([id, record]) => ({ id, name: (record as { name?: string }).name || id })));
      const requestedUid = new URLSearchParams(window.location.search).get('application') || '';
      if (requestedUid && /^[A-Za-z0-9_-]{1,128}$/.test(requestedUid)) {
        const applicationSnapshot = await get(ref(database, `partnerApplications/${requestedUid}`));
        const application = applicationSnapshot.val();
        if (!application || application.status !== 'pending' || application.uid !== requestedUid) {
          setMessage('This application is no longer pending. Open the request list to check its current status.');
        } else {
          setApplicationUid(requestedUid);
          setName(String(application.organizationName || ''));
          setType(String(application.organizationType || 'ngo'));
          setDistrict(String(application.district || ''));
          setLeaderEmail(String(application.email || ''));
        }
      }
    } catch {
      router.replace('/dashboard');
    } finally {
      setChecking(false);
    }
  }), [router]);

  const createPartner = async (event: FormEvent) => {
    event.preventDefault();
    if (!authorized || !database || busy) return;
    setBusy(true);
    setMessage('');
    try {
      const actor = getCurrentUser();
      if (!actor?.email || !(await isSuperAdmin(actor.email))) throw new Error('Super-admin access could not be confirmed.');
      const email = leaderEmail.trim().toLowerCase();
      const leaderQuery = query(ref(database, 'users'), orderByChild('email'), equalTo(email));
      const leaderSnapshot = await get(leaderQuery);
      const matches = leaderSnapshot.val() || {};
      const leaderUid = Object.keys(matches)[0];
      if (!leaderUid) throw new Error('The leader must create and verify their own account before you can activate this partner.');
      const leader = matches[leaderUid];
      if (leader.role && leader.role !== 'user') throw new Error('This account already has an administrative role. Review it manually.');
      if (leader.isBanned) throw new Error('A banned account cannot lead a partner organization.');
      if (applicationUid) {
        const applicationSnapshot = await get(ref(database, `partnerApplications/${applicationUid}`));
        const application = applicationSnapshot.val();
        if (!application || application.status !== 'pending' || application.uid !== leaderUid || application.email !== email) {
          throw new Error('This request changed or does not match the selected leader. Refresh the applications list.');
        }
      }

      let code = '';
      for (let attempt = 0; attempt < 5; attempt++) {
        const candidate = newInviteCode();
        if (!(await get(ref(database, `partnerInvites/${candidate}`))).exists()) {
          code = candidate;
          break;
        }
      }
      if (!code) throw new Error('Could not create a unique invite code. Please try again.');
      const instituteId = push(ref(database, 'partnerInstitutes')).key;
      if (!instituteId) throw new Error('Could not create a partner ID.');
      const now = new Date().toISOString();
      const partnerName = name.trim();
      const changes: Record<string, unknown> = {
        [`partnerInstitutes/${instituteId}`]: {
          name: partnerName,
          type,
          district: district.trim(),
          contactPerson: leader.name || email,
          email,
          status: 'approved',
          adminUserId: leaderUid,
          referralCode: code,
          createdAt: now,
          updatedAt: now
        },
        [`partnerInvites/${code}`]: { name: partnerName, instituteId, active: true },
        [`users/${leaderUid}/role`]: 'partner_admin',
        [`users/${leaderUid}/instituteId`]: instituteId,
        [`users/${leaderUid}/updatedAt`]: now
      };
      if (applicationUid) {
        changes[`partnerApplications/${applicationUid}/status`] = 'approved';
        changes[`partnerApplications/${applicationUid}/instituteId`] = instituteId;
        changes[`partnerApplications/${applicationUid}/reviewedAt`] = Date.now();
        changes[`partnerApplications/${applicationUid}/reviewedBy`] = actor.uid;
      }
      await update(ref(database), changes);
      setInviteLink(`${window.location.origin}/register?ref=${code}`);
      setPartners(previous => [...previous, { id: instituteId, name: partnerName }]);
      setSyncId(instituteId);
      setMessage('Partner activated. Test the signup link before sharing it.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not activate partner.');
    } finally {
      setBusy(false);
    }
  };

  const syncStats = async () => {
    if (!authorized || !database || !syncId || syncBusy) return;
    setSyncBusy(true);
    setSyncMessage('');
    try {
      const [members, requests] = await Promise.all([
        get(query(ref(database, 'users'), orderByChild('instituteId'), equalTo(syncId))),
        get(ref(database, 'bloodRequests')),
      ]);
      const { totalStudents, totalDonors, totalDonations, totalBloodRequests } = countPartnerImpact(members.val(), requests.val());
      const updatedAt = new Date().toISOString();
      await update(ref(database), {
        [`partnerStats/${syncId}`]: { totalStudents, totalDonors, totalDonations, totalBloodRequests, updatedAt },
        [`partnerInstitutes/${syncId}/totalDonors`]: totalDonors,
        [`partnerInstitutes/${syncId}/totalDonations`]: totalDonations,
        [`partnerInstitutes/${syncId}/updatedAt`]: updatedAt
      });
      setSyncMessage(`Updated: ${totalStudents} signups, ${totalDonors} donors, ${totalDonations} donations and ${totalBloodRequests} blood requests.`);
    } catch {
      setSyncMessage('Could not refresh partner counts. Check your super-admin access and database rules.');
    } finally {
      setSyncBusy(false);
    }
  };

  if (checking) return <main className="min-h-screen bg-[#F5EDD8] p-8">Checking access…</main>;
  if (!authorized) return null;

  return <main className="min-h-screen bg-[#F5EDD8] px-5 py-10 text-[#1A0F0A]">
    <div className="mx-auto max-w-2xl">
      <Link href="/super-admin/partner-control" className="text-sm font-semibold text-[#C0152A]">← Partner control</Link>
      <p className="mt-8 text-xs font-bold uppercase tracking-[.2em] text-[#C0152A]">Super admin · partner operations</p>
      <h1 className="mt-3 font-serif text-4xl font-bold">Activate a partner</h1>
      {applicationUid && <p className="mt-3 rounded-xl border border-[#C0152A]/15 bg-[#FDFAF4] p-4 text-sm">Reviewing a verified leader request. Check the organization details below before activation.</p>}
      <p className="mt-4 leading-7 text-[#5C463B]">The organization leader should <Link href="/partner-account" className="font-semibold text-[#C0152A] underline">create a leader account</Link> and verify their email. Activation gives that account access to this partner only; email verification is required to open the partner dashboard. Students still sign up themselves using the invitation link.</p>

      <form onSubmit={createPartner} className="mt-8 space-y-5 rounded-3xl border border-[#C0152A]/10 bg-[#FDFAF4] p-7 shadow-lg">
        <label className="block text-sm font-semibold">Organization name
          <input required maxLength={120} value={name} onChange={event => setName(event.target.value)} className="mt-2 w-full rounded-xl border border-[#C0152A]/20 bg-white p-3 font-normal" placeholder="Moonlight Foundation" />
        </label>
        <label className="block text-sm font-semibold">Organization type
          <select value={type} onChange={event => setType(event.target.value)} className="mt-2 w-full rounded-xl border border-[#C0152A]/20 bg-white p-3 font-normal">
            <option value="ngo">Student-led organization / NGO</option><option value="university">University club</option><option value="college">College club</option><option value="corporate">Other partner</option>
          </select>
        </label>
        <label className="block text-sm font-semibold">District
          <input required maxLength={80} value={district} onChange={event => setDistrict(event.target.value)} className="mt-2 w-full rounded-xl border border-[#C0152A]/20 bg-white p-3 font-normal" placeholder="Dhaka" />
        </label>
        <label className="block text-sm font-semibold">Leader's existing account email
          <input required type="email" value={leaderEmail} onChange={event => setLeaderEmail(event.target.value)} className="mt-2 w-full rounded-xl border border-[#C0152A]/20 bg-white p-3 font-normal" placeholder="leader@example.org" />
        </label>
        <button disabled={busy} className="w-full rounded-xl bg-[#C0152A] px-5 py-3.5 font-semibold text-white disabled:opacity-60">{busy ? 'Activating…' : 'Activate partner and create link'}</button>
        {message && <p role="status" className="rounded-xl bg-[#F5EDD8] p-4 text-sm">{message}</p>}
      </form>
      {inviteLink && <div className="mt-5 rounded-2xl border border-green-200 bg-white p-5">
        <p className="text-sm font-semibold text-green-800">Private invitation link for this partner</p>
        <p className="mt-2 break-all text-sm">{inviteLink}</p>
        <button onClick={() => navigator.clipboard.writeText(inviteLink)} className="mt-4 rounded-xl border border-[#C0152A]/20 px-4 py-2 text-sm font-semibold text-[#C0152A]">Copy link</button>
      </div>}
      <section className="mt-8 rounded-3xl border border-[#C0152A]/10 bg-[#FDFAF4] p-7">
        <h2 className="font-serif text-2xl font-bold">Refresh partner counts</h2>
        <p className="mt-2 text-sm leading-6 text-[#5C463B]">Refresh signups, registered donors, donations and blood requests for one partner. Partner leaders see only aggregate counts, never private student or request records.</p>
        <select value={syncId} onChange={event => setSyncId(event.target.value)} className="mt-5 w-full rounded-xl border border-[#C0152A]/20 bg-white p-3">
          <option value="">Select a partner</option>
          {partners.map(partner => <option key={partner.id} value={partner.id}>{partner.name}</option>)}
        </select>
        <button disabled={!syncId || syncBusy} onClick={syncStats} className="mt-4 rounded-xl bg-[#1B5E6B] px-5 py-3 font-semibold text-white disabled:opacity-60">{syncBusy ? 'Refreshing…' : 'Refresh counts'}</button>
        {syncMessage && <p role="status" className="mt-4 text-sm text-[#5C463B]">{syncMessage}</p>}
      </section>
    </div>
  </main>;
}
