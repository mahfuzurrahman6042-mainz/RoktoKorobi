'use client';

import { useCallback, useEffect, useState } from 'react';
import { database, get, getCurrentUser, ref, update } from '@/lib/firebase';

type Country = 'IN' | 'PK';
type RequestRecord = {
  id: string;
  country: Country;
  patientName?: string;
  bloodType?: string;
  hospital?: string;
  location?: string;
  contact?: string;
  urgency?: string;
  timestamp?: string;
  status?: string;
  fulfilled?: boolean;
};

const countries: { code: Country; label: string }[] = [
  { code: 'IN', label: 'India' },
  { code: 'PK', label: 'Pakistan' },
];

export default function CountryRequestReview() {
  const [country, setCountry] = useState<Country>('IN');
  const [requests, setRequests] = useState<RequestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setMessage('');
    try {
      if (!database) throw new Error('Database is unavailable.');
      const snapshot = await get(ref(database, `countryData/${country}/bloodRequests`));
      const values = snapshot.val() as Record<string, Omit<RequestRecord, 'id'>> | null;
      setRequests(Object.entries(values ?? {}).map(([id, value]) => ({ ...value, id, country }))
        .sort((a, b) => String(b.timestamp ?? '').localeCompare(String(a.timestamp ?? ''))));
    } catch (error) {
      setRequests([]);
      setMessage(error instanceof Error ? error.message : 'Could not load requests.');
    } finally {
      setLoading(false);
    }
  }, [country]);

  useEffect(() => { void refresh(); }, [refresh]);

  const review = async (request: RequestRecord, decision: 'approved' | 'rejected') => {
    if (!database || !getCurrentUser()) return setMessage('Sign in as super admin to review requests.');
    if (!window.confirm(`${decision === 'approved' ? 'Approve' : 'Reject'} this ${country === 'IN' ? 'India' : 'Pakistan'} request? This changes its status. Notifications remain separately gated.`)) return;
    setBusyId(request.id);
    setMessage('');
    try {
      await update(ref(database, `countryData/${country}/bloodRequests/${request.id}`), {
        status: decision,
        reviewedBy: getCurrentUser()?.uid,
        reviewedAt: new Date().toISOString(),
      });
      await refresh();
      setMessage(`Request ${decision}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Review failed.');
    } finally {
      setBusyId(null);
    }
  };

  return <section aria-labelledby="country-requests-title" className="mt-10 rounded-2xl border border-[#E4D6BE] bg-[#FDF9F3] p-5 text-[#2A1A14]">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-xs font-semibold uppercase tracking-widest text-[#8E0F20]">Country review</p><h2 id="country-requests-title" className="mt-2 text-2xl font-semibold">India and Pakistan requests</h2><p className="mt-2 max-w-2xl text-sm text-[#6B5A50]">Review pending requests before publication. This does not activate enrollment or alerts.</p></div>
      <button type="button" onClick={() => void refresh()} className="min-h-11 rounded-xl border border-[#B8132A] px-4 font-semibold text-[#8E0F20]">Refresh</button>
    </div>
    <div className="mt-5 flex gap-2" role="group" aria-label="Request country">
      {countries.map(item => <button key={item.code} type="button" onClick={() => setCountry(item.code)} aria-pressed={country === item.code} className={`min-h-11 rounded-xl px-4 font-semibold ${country === item.code ? 'bg-[#B8132A] text-white' : 'border border-[#E4D6BE] bg-white text-[#2A1A14]'}`}>{item.label}</button>)}
    </div>
    {message && <p role="status" className="mt-4 rounded-xl bg-[#F6EEDD] p-3 text-sm">{message}</p>}
    {loading ? <p className="mt-6" role="status">Loading requests…</p> : requests.length === 0 ? <p className="mt-6 text-[#6B5A50]">No requests in this country.</p> : <div className="mt-6 space-y-3">
      {requests.map(request => <article key={request.id} className="rounded-xl border border-[#E4D6BE] bg-white p-4">
        <div className="flex flex-wrap justify-between gap-3"><div><h3 className="font-semibold">{request.patientName || 'Unnamed patient'} · {request.bloodType || 'Blood group unknown'}</h3><p className="mt-1 text-sm text-[#6B5A50]">{request.hospital || 'Hospital not provided'} · {request.location || 'Location not provided'}</p><p className="mt-1 text-sm">Contact: {request.contact || 'Not provided'}</p></div><span className="rounded-full bg-[#F6EEDD] px-3 py-1 text-sm font-semibold self-start">{request.fulfilled ? 'Fulfilled' : request.status || 'Pending'}</span></div>
        {request.status === 'pending' && !request.fulfilled && <div className="mt-4 flex flex-wrap gap-2"><button type="button" disabled={busyId === request.id} onClick={() => void review(request, 'approved')} className="min-h-11 rounded-xl bg-[#B8132A] px-4 font-semibold text-white disabled:opacity-50">Approve</button><button type="button" disabled={busyId === request.id} onClick={() => void review(request, 'rejected')} className="min-h-11 rounded-xl border border-[#B8132A] px-4 font-semibold text-[#8E0F20] disabled:opacity-50">Reject</button></div>}
      </article>)}
    </div>}
  </section>;
}
