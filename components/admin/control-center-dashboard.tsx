'use client';

import Link from 'next/link';
import { Activity, ArrowRight, ArrowUpRight, Building2, AlertTriangle as CircleAlert, Droplet, FileText, Heart, Plus, RefreshCw, ShieldCheck, Users } from 'lucide-react';
import { useAdmin } from './admin-layout';
import { formatCount, formatDate } from '@/lib/admin/helpers';

const actions = [
  { title: 'Activate a partner', detail: 'Create an institution after its leader has a verified account.', href: '/super-admin/partner-onboard', icon: Plus },
  { title: 'Review blood requests', detail: 'Check open and pending requests across the network.', href: '/super-admin/operations/requests', icon: Droplet },
  { title: 'Manage access', detail: 'Review people, roles and administrator permissions.', href: '/super-admin/people', icon: ShieldCheck },
  { title: 'Publish an update', detail: 'Write a blog post for donors and the community.', href: '/admin/blogs/new', icon: FileText },
];

export function ControlCenterDashboard() {
  const { snapshot, state, reload } = useAdmin();
  const ready = state === 'ready';
  const count = (value: number | null) => ready ? formatCount(value) : '—';
  const metrics = [
    { title: 'Open requests', value: snapshot.requestStatus.open, href: '/super-admin/operations/requests', icon: Droplet, detail: 'Needs a response' },
    { title: 'Active donors', value: snapshot.metrics.donors, href: '/super-admin/people', icon: Heart, detail: 'In the donor network' },
    { title: 'Active partners', value: snapshot.partnerStatus.active, href: '/super-admin/partners', icon: Building2, detail: 'Institutions on board' },
    { title: 'Registered users', value: snapshot.metrics.users, href: '/super-admin/people', icon: Users, detail: 'Across the platform' },
  ];

  return <div className="cc-page">
    <section className="cc-hero" aria-labelledby="dashboard-title">
      <div><p className="cc-eyebrow">Your control center</p><h1 id="dashboard-title">Keep the network moving.</h1><p>See what needs attention, reach the right tools, and stay close to the people behind every request.</p></div>
      <div className="cc-hero-actions"><button className="cc-button" type="button" onClick={() => void reload()} disabled={state === 'loading'}><RefreshCw size={16} aria-hidden="true" />Refresh data</button><Link className="cc-button cc-button-primary" href="/super-admin/partner-onboard"><Plus size={17} aria-hidden="true" />Activate partner</Link></div>
    </section>

    {state !== 'ready' && <div className={'cc-data-message' + (state === 'error' ? ' is-error' : '')} role="status"><CircleAlert size={18} aria-hidden="true" /><span>{state === 'loading' ? 'Loading current platform data…' : state === 'unconfigured' ? 'Data source is not configured. Counts are unavailable.' : state === 'forbidden' ? 'You do not have access to this data.' : 'Could not load platform data. Please try again.'}</span>{state === 'error' && <button type="button" onClick={() => void reload()}>Retry</button>}</div>}

    <section className="cc-section" aria-labelledby="priorities-heading"><div className="cc-section-heading"><div><p className="cc-eyebrow">At a glance</p><h2 id="priorities-heading">What needs your attention</h2></div><Link className="cc-text-link" href="/super-admin/operations">All operations <ArrowRight size={15} aria-hidden="true" /></Link></div>
      <div className="cc-priorities">
        <Link className="cc-priority" href="/super-admin/operations/requests"><span className="cc-priority-icon"><Droplet size={21} aria-hidden="true" /></span><span><strong>{count(snapshot.requestStatus.open)} open blood requests</strong><small>Review urgent needs and their current status.</small><em>Review requests <ArrowRight size={13} aria-hidden="true" /></em></span></Link>
        <Link className="cc-priority cc-priority-tone-gold" href="/super-admin/partners"><span className="cc-priority-icon"><Building2 size={21} aria-hidden="true" /></span><span><strong>{count(snapshot.partnerStatus.pending)} pending partners</strong><small>Check institution status before activation.</small><em>Open partners <ArrowRight size={13} aria-hidden="true" /></em></span></Link>
        <Link className="cc-priority cc-priority-tone-teal" href="/super-admin/people"><span className="cc-priority-icon"><Users size={21} aria-hidden="true" /></span><span><strong>{count(snapshot.metrics.verifiedUsers)} verified users</strong><small>Keep the community and admin access in view.</small><em>View people <ArrowRight size={13} aria-hidden="true" /></em></span></Link>
      </div>
    </section>

    <section className="cc-section" aria-labelledby="metrics-heading"><div className="cc-section-heading"><div><p className="cc-eyebrow">Platform pulse</p><h2 id="metrics-heading">The network today</h2></div><span className="cc-connection"><i aria-hidden="true" />{ready ? 'Current snapshot' : 'Awaiting data'}</span></div><div className="cc-metrics">{metrics.map(({ title, value, href, icon: Icon, detail }) => <Link className="cc-metric" href={href} key={title}><span className="cc-metric-top"><span>{title}</span><Icon size={19} aria-hidden="true" /></span><strong>{count(value)}</strong><small>{detail} <ArrowUpRight size={13} aria-hidden="true" /></small></Link>)}</div></section>

    <section className="cc-section" aria-labelledby="actions-heading"><div className="cc-section-heading"><div><p className="cc-eyebrow">Shortcuts</p><h2 id="actions-heading">Move directly to the work</h2></div></div><div className="cc-action-grid">{actions.map(({ title, detail, href, icon: Icon }) => <Link className="cc-action-card" href={href} key={title}><span className="cc-action-icon"><Icon size={19} aria-hidden="true" /></span><span><strong>{title}</strong><small>{detail}</small></span><ArrowRight size={17} aria-hidden="true" /></Link>)}</div></section>

    <section className="cc-section cc-lower-grid" aria-label="Activity and guidance"><div className="cc-panel"><div className="cc-panel-heading"><h2>Recent activity</h2><Link className="cc-text-link" href="/super-admin/overview/activity">View all <ArrowRight size={14} aria-hidden="true" /></Link></div>{ready && snapshot.activities.length ? <ol className="cc-activity-list">{snapshot.activities.slice(0, 5).map(activity => <li key={activity.id}><span className="cc-activity-dot" aria-hidden="true" /><span><strong>{activity.type}</strong><small>{activity.description} · {activity.relatedLabel}</small></span><time dateTime={activity.occurredAt}>{formatDate(activity.occurredAt)}</time></li>)}</ol> : <div className="cc-empty"><Activity size={23} aria-hidden="true" /><strong>{ready ? 'No recent activity' : 'Activity is unavailable'}</strong><p>{ready ? 'Recorded platform activity will appear here.' : 'Connect to platform data to see recent changes.'}</p></div>}</div>
      <aside className="cc-note" aria-label="Partner onboarding guidance"><CircleAlert size={18} aria-hidden="true" /><p><strong>Partner onboarding is admin-led</strong>The institution leader needs a verified account first. Then use Activate partner to create the institution and referral link. The public partner registration form is not accepting submissions yet.</p></aside></section>
  </div>;
}
