'use client';
import { useState } from 'react';
import { useAdmin } from './admin-layout';
import { distributionValues, formatCount } from '@/lib/admin/helpers';
export function OperationalSummaries() {
  const { snapshot, state } = useAdmin();
  const [view, setView] = useState<'partners' | 'requests'>('partners');
  const entries = Object.entries(view === 'partners' ? snapshot.partnerStatus : snapshot.requestStatus);
  const distribution = state === 'ready' ? distributionValues(entries.map(([, value]) => value)) : null;
  return <section className="rr-panel rr-summaries" aria-labelledby="summaries-heading"><div className="rr-panel-heading"><div><h2 id="summaries-heading">Operational summary</h2><p>Status across your network</p></div></div><div className="rr-segment" role="group" aria-label="Summary type"><button aria-pressed={view === 'partners'} onClick={() => setView('partners')}>Partners</button><button aria-pressed={view === 'requests'} onClick={() => setView('requests')}>Blood requests</button></div><div className="rr-summary-bars">{entries.map(([label, count], index) => <div key={label}><div className="rr-bar-label"><span>{label}</span><strong>{distribution ? formatCount(count) : '—'}</strong></div>{distribution && distribution.total > 0 ? <div className="rr-bar-track" role="meter" aria-label={label} aria-valuenow={count ?? 0} aria-valuemin={0} aria-valuemax={distribution.total}><span style={{ width: `${distribution.percentages[index]}%` }} /></div> : <div className="rr-bar-track" aria-hidden="true" />}</div>)}</div><p className="rr-summary-note">{distribution ? distribution.total === 0 ? 'No records yet.' : `${formatCount(distribution.total)} records in total` : 'Awaiting sync · No distribution data available'}</p></section>;
}
