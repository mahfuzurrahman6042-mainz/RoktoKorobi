'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Building2, Check, RefreshCw, Search, X } from 'lucide-react';
import { database, get, getCurrentUser, isSuperAdmin, ref, update } from '@/lib/firebase';

type Application = {
  uid: string; email: string; organizationName: string; organizationType: string;
  district: string; contactPhone: string; message: string;
  status: 'pending' | 'approved' | 'rejected'; createdAt: number;
  rejectionReason?: string; instituteId?: string;
};

export default function PartnerApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('pending');
  const [rejectingUid, setRejectingUid] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const actor = getCurrentUser();
      if (!database || !actor?.email || !(await isSuperAdmin(actor.email))) throw new Error('Super-admin access is required.');
      const snapshot = await get(ref(database, 'partnerApplications'));
      const values = (snapshot.val() || {}) as Record<string, Omit<Application, 'uid'>>;
      setApplications(Object.entries(values).map(([uid, value]) => ({ ...value, uid })).sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0)));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load applications.');
    } finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);

  const filtered = useMemo(() => applications.filter(item =>
    (status === 'all' || item.status === status) &&
    `${item.organizationName} ${item.email} ${item.district}`.toLowerCase().includes(search.trim().toLowerCase())
  ), [applications, search, status]);

  const reject = async (item: Application) => {
    if (!database || busy || item.status !== 'pending') return;
    if (!reason.trim()) { setError('Add a reason before rejecting this request.'); return; }
    setBusy(true);
    setError('');
    try {
      const actor = getCurrentUser();
      if (!actor?.email || !(await isSuperAdmin(actor.email))) throw new Error('Super-admin access could not be confirmed.');
      const logId = crypto.randomUUID();
      await update(ref(database), {
        [`partnerApplications/${item.uid}/status`]: 'rejected',
        [`partnerApplications/${item.uid}/rejectionReason`]: reason.trim(),
        [`partnerApplications/${item.uid}/reviewedAt`]: Date.now(),
        [`partnerApplications/${item.uid}/reviewedBy`]: actor.uid,
        [`activityLogs/${logId}`]: { action: 'partner_application_rejected', entity: 'partnerApplication', entityId: item.uid, performedBy: actor.uid, timestamp: new Date().toISOString(), details: reason.trim() },
      });
      setApplications(previous => previous.map(application => application.uid === item.uid ? { ...application, status: 'rejected', rejectionReason: reason.trim() } : application));
      setRejectingUid(null);
      setReason('');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not reject this request.'); }
    finally { setBusy(false); }
  };

  return <main className="min-h-screen bg-[#F5EDD8] px-5 py-10 text-[#1A0F0A]">
    <div className="mx-auto max-w-5xl">
      <Link href="/super-admin/partners" className="inline-flex items-center gap-2 text-sm font-semibold text-[#A5102F]"><ArrowLeft size={16} aria-hidden="true" />Partners</Link>
      <div className="mt-7 flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-[#A5102F]">Partner operations</p><h1 className="mt-2 font-serif text-4xl font-bold">Organization requests</h1><p className="mt-3 text-[#5C463B]">Review requests before granting a leader access to a partner workspace.</p></div><button type="button" onClick={() => void load()} disabled={loading || busy} className="inline-flex items-center gap-2 rounded-xl border border-[#C0152A]/20 bg-white px-4 py-2.5 font-semibold text-[#A5102F] disabled:opacity-60"><RefreshCw size={16} aria-hidden="true" />Refresh</button></div>
      {error && <p role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-900">{error}</p>}
      <div className="mt-7 grid gap-3 rounded-2xl border border-[#C0152A]/10 bg-[#FDFAF4] p-4 sm:grid-cols-[1fr_auto]"><label className="flex items-center gap-2 rounded-xl border border-[#C0152A]/20 bg-white px-3"><Search size={17} aria-hidden="true" /><span className="sr-only">Search applications</span><input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search organization, email, district" className="min-w-0 flex-1 bg-transparent py-3 outline-none" /></label><label><span className="sr-only">Filter applications by status</span><select value={status} onChange={event => setStatus(event.target.value)} className="w-full rounded-xl border border-[#C0152A]/20 bg-white px-3 py-3 sm:w-44"><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="all">All statuses</option></select></label></div>
      {loading ? <p role="status" className="mt-7">Loading organization requests…</p> : filtered.length ? <div className="mt-5 grid gap-4">{filtered.map(item => <article key={item.uid} className="rounded-2xl border border-[#C0152A]/10 bg-[#FDFAF4] p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3"><div className="flex items-start gap-3"><span className="rounded-xl bg-[#C0152A]/10 p-2.5 text-[#A5102F]"><Building2 size={21} aria-hidden="true" /></span><div><h2 className="font-serif text-xl font-bold">{item.organizationName}</h2><p className="mt-1 text-sm text-[#5C463B]">{item.organizationType} · {item.district}</p></div></div><span className="rounded-full bg-[#F5EDD8] px-3 py-1 text-xs font-bold uppercase text-[#A5102F]">{item.status}</span></div>
        <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2"><div><dt className="font-semibold">Leader email</dt><dd className="break-all">{item.email}</dd></div><div><dt className="font-semibold">Contact phone</dt><dd>{item.contactPhone}</dd></div><div><dt className="font-semibold">Submitted</dt><dd>{Number.isFinite(item.createdAt) ? new Date(item.createdAt).toLocaleDateString() : 'Unknown'}</dd></div><div><dt className="font-semibold">Account</dt><dd className="break-all font-mono text-xs">{item.uid}</dd></div></dl>
        {item.message && <p className="mt-4 rounded-xl bg-[#F5EDD8] p-4 text-sm leading-6">{item.message}</p>}
        {item.status === 'pending' && <div className="mt-5 flex flex-wrap gap-2"><Link href={`/super-admin/partner-onboard?application=${encodeURIComponent(item.uid)}`} className="inline-flex items-center gap-2 rounded-xl bg-[#A5102F] px-4 py-2.5 text-sm font-semibold text-white"><Check size={16} aria-hidden="true" />Review and activate</Link><button type="button" onClick={() => { setRejectingUid(item.uid); setReason(''); setError(''); }} className="inline-flex items-center gap-2 rounded-xl border border-[#A5102F]/20 px-4 py-2.5 text-sm font-semibold text-[#A5102F]"><X size={16} aria-hidden="true" />Decline</button></div>}
        {rejectingUid === item.uid && <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4"><label htmlFor={`reason-${item.uid}`} className="block text-sm font-semibold">Reason for declining</label><textarea id={`reason-${item.uid}`} maxLength={500} rows={3} value={reason} onChange={event => setReason(event.target.value)} className="mt-2 w-full rounded-lg border border-rose-200 bg-white p-3" /><div className="mt-3 flex gap-2"><button type="button" disabled={busy} onClick={() => void reject(item)} className="rounded-lg bg-[#A5102F] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">Confirm decline</button><button type="button" onClick={() => setRejectingUid(null)} className="rounded-lg px-4 py-2 text-sm font-semibold">Cancel</button></div></div>}
        {item.status === 'rejected' && item.rejectionReason && <p className="mt-4 text-sm text-rose-800">Reason: {item.rejectionReason}</p>}
      </article>)}</div> : <div className="mt-5 rounded-2xl border border-[#C0152A]/10 bg-[#FDFAF4] p-10 text-center"><strong>No matching requests</strong><p className="mt-2 text-sm text-[#5C463B]">New verified leader requests will appear here.</p></div>}
    </div>
  </main>;
}
