'use client';
import Link from 'next/link';
import { ArrowUpRight, Building2, Clock3, PauseCircle, UserPlus, RefreshCw, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { useAdmin } from './admin-layout';
import { formatCount, formatDate, safeReferralUrl } from '@/lib/admin/helpers';
import { MetricCard } from './metric-card';

export function PartnerSummary() {
  const { snapshot, state, reload, refreshPartnerStatistics } = useAdmin();
  const [refreshState, setRefreshState] = useState<'idle' | 'refreshing' | 'error'>('idle');
  async function refresh() {
    if (!refreshPartnerStatistics) return;
    setRefreshState('refreshing');
    try { await refreshPartnerStatistics(); await reload(); setRefreshState('idle'); }
    catch { setRefreshState('error'); }
  }
  return <section className="rr-partner-section" aria-labelledby="partner-heading"><div className="rr-section-heading"><div><div className="rr-eyebrow">Your institutional network</div><h2 id="partner-heading">Partner operations</h2><p>Manage institutions, applications, and the communities they reach.</p></div><Link className="rr-text-link" href="/super-admin/partner-control">Open control center <ArrowUpRight size={16} aria-hidden="true" /></Link></div><div className="rr-partner-grid"><div className="rr-partner-lead"><span className="rr-icon-tile"><Building2 size={21} aria-hidden="true" /></span><h3>A stronger network.<br />A more coordinated response.</h3><p>Bring partner institutions into one clear, connected workflow.</p><Link className="rr-button rr-button-primary" href="/super-admin/partner-onboard"><UserPlus size={16} aria-hidden="true" />Activate new partner</Link><Link className="rr-text-link" href="/super-admin/partner-institutes?status=pending">Review applications <ArrowUpRight size={15} aria-hidden="true" /></Link></div><div className="rr-partner-stats"><div className="rr-three-grid"><MetricCard label="Active partners" value={snapshot.partnerStatus.active} description="Currently participating" icon={Building2} state={state} tone="teal" /><MetricCard label="Pending applications" value={snapshot.partnerStatus.pending} description="Awaiting review" icon={Clock3} state={state} /><MetricCard label="Suspended partners" value={snapshot.partnerStatus.suspended} description="Access on hold" icon={PauseCircle} state={state} /></div><div className="rr-referral-strip"><div><span>Students reached through referrals</span><strong>{state === 'ready' ? formatCount(snapshot.metrics.students) : '—'}</strong></div><span className="rr-small-label">{state === 'ready' && snapshot.metrics.students !== null ? 'Verified partner referral count' : 'Awaiting sync'}</span></div><div className="rr-sync-row"><span>Last statistics sync: <strong>{snapshot.health.lastSync ? formatDate(snapshot.health.lastSync) : 'Awaiting sync'}</strong></span><button className="rr-button rr-button-small" disabled={!refreshPartnerStatistics || refreshState === 'refreshing'} onClick={refresh} title={!refreshPartnerStatistics ? 'Connect the existing partner statistics helper to enable refresh' : undefined}><RefreshCw size={14} aria-hidden="true" />{refreshState === 'refreshing' ? 'Refreshing…' : 'Refresh statistics'}</button>{refreshState === 'error' && <span role="alert">Refresh failed. Please try again.</span>}</div></div></div></section>;
}

export function ReferralCopy({ url }: { url?: string }) {
  const [message, setMessage] = useState('');
  const href = safeReferralUrl(url);
  async function copy() {
    if (!href) return;
    try { await navigator.clipboard.writeText(href); setMessage('Copied'); }
    catch { setMessage('Copy failed. Check browser clipboard permissions.'); }
  }
  return <div className="rr-copy"><button className="rr-button rr-button-small" disabled={!href} onClick={copy} title={!href ? 'No referral link available' : 'Copy this institution’s referral link'}>{message === 'Copied' ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}Copy referral link</button><span role="status" className="rr-small-label">{message}</span></div>;
}
