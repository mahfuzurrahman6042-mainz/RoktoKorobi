'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import type { User } from 'firebase/auth';
import { Building2, CheckCircle2, Clock3, ShieldCheck } from 'lucide-react';
import { database, get, onAuthStateChange, ref, set } from '@/lib/firebase';

type Application = {
  uid: string; email: string; organizationName: string; organizationType: string;
  district: string; contactPhone: string; message: string;
  status: 'pending' | 'approved' | 'rejected'; createdAt: number;
  rejectionReason?: string;
};

export default function PartnerRequestPage() {
  const [user, setUser] = useState<User | null>(null);
  const [state, setState] = useState<'loading' | 'signed-out' | 'unverified' | 'ready' | 'error'>('loading');
  const [application, setApplication] = useState<Application | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState('ngo');
  const [district, setDistrict] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const field = 'mt-2 w-full rounded-xl border border-[#C0152A]/20 bg-white px-4 py-3 text-base focus-visible:outline-2 focus-visible:outline-[#A5102F]';

  useEffect(() => onAuthStateChange(async currentUser => {
    setUser(currentUser);
    if (!currentUser) { setState('signed-out'); return; }
    if (!currentUser.emailVerified) { setState('unverified'); return; }
    try {
      if (!database) throw new Error('Database unavailable');
      const [profileSnapshot, applicationSnapshot] = await Promise.all([
        get(ref(database, `users/${currentUser.uid}`)),
        get(ref(database, `partnerApplications/${currentUser.uid}`)),
      ]);
      if (!profileSnapshot.exists()) throw new Error('Complete your leader account first.');
      setPhone(String(profileSnapshot.val()?.phone || ''));
      setApplication(applicationSnapshot.exists() ? applicationSnapshot.val() as Application : null);
      setState('ready');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load your request.');
      setState('error');
    }
  }), []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user?.email || !user.emailVerified || !database || application || busy) return;
    setError('');
    if (name.trim().length < 2 || district.trim().length < 2 || phone.trim().length < 5) {
      setError('Please complete the organization name, district, and contact phone.');
      return;
    }
    setBusy(true);
    try {
      const record: Application = {
        uid: user.uid,
        email: user.email,
        organizationName: name.trim(), organizationType: type,
        district: district.trim(), contactPhone: phone.trim(),
        message: message.trim(), status: 'pending', createdAt: Date.now(),
      };
      await set(ref(database, `partnerApplications/${user.uid}`), record);
      setApplication(record);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Your request could not be submitted.');
    } finally { setBusy(false); }
  };

  return <main className="min-h-screen bg-[#F5EDD8] px-5 py-10 text-[#1A0F0A]">
    <div className="mx-auto max-w-2xl">
      <Link href="/partner-register" className="text-sm font-semibold text-[#A5102F] hover:underline">← Partner information</Link>
      <div className="mt-7 rounded-3xl border border-[#C0152A]/10 bg-[#FDFAF4] p-6 shadow-[0_18px_55px_rgba(68,25,27,.08)] sm:p-9">
        <span className="inline-flex items-center gap-2 rounded-full bg-[#C0152A]/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#A5102F]"><Building2 size={15} aria-hidden="true" />Partner application</span>
        <h1 className="mt-5 font-serif text-3xl font-bold sm:text-4xl">Request to become a partner</h1>
        <p className="mt-3 leading-7 text-[#5C463B]">Tell us about your organization. Submitting a request does not give access to any partner or student data. A super admin reviews it first.</p>
        {state === 'loading' && <p role="status" className="mt-8">Checking your account…</p>}
        {state === 'signed-out' && <div className="mt-8 rounded-2xl bg-[#F5EDD8] p-5"><p>Sign in with your leader account to request partnership.</p><Link href="/login?next=%2Fpartner-request" className="mt-4 inline-flex rounded-xl bg-[#A5102F] px-5 py-3 font-semibold text-white">Sign in</Link> <Link href="/partner-account" className="ml-3 font-semibold text-[#A5102F] underline">Create account</Link></div>}
        {state === 'unverified' && <div className="mt-8 rounded-2xl bg-[#F5EDD8] p-5"><p>Verify your email before submitting an organization request.</p><Link href="/verify-email?next=%2Fpartner-request" className="mt-4 inline-flex rounded-xl bg-[#A5102F] px-5 py-3 font-semibold text-white">Verify email</Link></div>}
        {state === 'error' && <div role="alert" className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-900"><p>{error}</p><Link href="/partner-account" className="mt-3 inline-block font-semibold underline">Leader account information</Link></div>}
        {state === 'ready' && application && <div role="status" className="mt-8 rounded-2xl border border-[#C0152A]/15 bg-[#F5EDD8] p-6">
          {application.status === 'approved' ? <CheckCircle2 className="text-emerald-700" size={28} aria-hidden="true" /> : <Clock3 className="text-[#A5102F]" size={28} aria-hidden="true" />}
          <h2 className="mt-3 text-xl font-bold">{application.status === 'pending' ? 'Request received' : application.status === 'approved' ? 'Partner approved' : 'Request not approved'}</h2>
          <p className="mt-2 leading-7">{application.organizationName} · {application.district}</p>
          <p className="mt-1 text-sm text-[#5C463B]">{application.status === 'pending' ? 'Your request is awaiting super-admin review. We will use your account email to identify you.' : application.status === 'approved' ? 'Your organization has been activated. Open your partner dashboard after signing in.' : application.rejectionReason || 'Contact the RoktoKorobi team if you need more information.'}</p>
          {application.status === 'approved' && <Link href="/dashboard/partner" className="mt-4 inline-flex rounded-xl bg-[#A5102F] px-5 py-3 font-semibold text-white">Open partner dashboard</Link>}
        </div>}
        {state === 'ready' && !application && <form onSubmit={submit} className="mt-8 space-y-5">
          <label className="block text-sm font-semibold">Organization name<input required minLength={2} maxLength={120} value={name} onChange={event => setName(event.target.value)} className={field} placeholder="Korobi Campus Club" /></label>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-semibold">Organization type<select value={type} onChange={event => setType(event.target.value)} className={field}><option value="ngo">NGO / student organization</option><option value="university">University club</option><option value="college">College club</option><option value="corporate">Other organization</option></select></label>
            <label className="block text-sm font-semibold">District<input required minLength={2} maxLength={80} value={district} onChange={event => setDistrict(event.target.value)} className={field} placeholder="Dhaka" /></label>
          </div>
          <label className="block text-sm font-semibold">Contact phone<input required type="tel" minLength={5} maxLength={30} value={phone} onChange={event => setPhone(event.target.value)} className={field} /></label>
          <label className="block text-sm font-semibold">What would your organization like to do? <span className="font-normal">(optional)</span><textarea rows={4} maxLength={500} value={message} onChange={event => setMessage(event.target.value)} className={field} /></label>
          <p className="text-sm text-[#5C463B]">Requesting as <strong>{user?.email}</strong>. You can submit one request per account.</p>
          {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-900">{error}</p>}
          <button type="submit" disabled={busy} className="w-full rounded-xl bg-[#A5102F] px-5 py-3.5 font-semibold text-white disabled:opacity-60">{busy ? 'Submitting…' : 'Submit partner request'}</button>
        </form>}
      </div>
      <p className="mt-5 flex items-start gap-2 text-sm text-[#5C463B]"><ShieldCheck size={17} className="mt-0.5 shrink-0" aria-hidden="true" />Only a super admin can approve this request and create your partner workspace.</p>
    </div>
  </main>;
}
