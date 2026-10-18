'use client';

import Link from 'next/link';
import { Activity, ArrowRight, ArrowUpRight, Building2, AlertTriangle as CircleAlert, Droplet, Heart, Plus, RefreshCw, ShieldCheck, Users } from 'lucide-react';
import { useAdmin } from './admin-layout';
import { formatCount } from '@/lib/admin/helpers';

const actions = [
  { title: 'Activate a partner', detail: 'Create an institution after its leader has a verified account.', href: '/super-admin/partner-onboard', cta: 'Start', icon: Plus },
  { title: 'Review blood requests', detail: 'Check open and pending requests across the network.', href: '/super-admin/operations/requests', cta: 'Open', icon: Droplet },
  { title: 'Manage access', detail: 'Review accounts, roles and administrator permissions.', href: '/super-admin/people/users', cta: 'Open', icon: ShieldCheck },
  { title: 'Review activity', detail: 'See the recent actions across the platform.', href: '/super-admin/overview/activity', cta: 'Open', icon: Activity },
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

    <section className="cc-section" aria-labelledby="actions-heading"><div className="cc-section-heading"><div><p className="cc-eyebrow">Shortcuts</p><h2 id="actions-heading">Move directly to the work</h2></div></div><div className="cc-action-grid">{actions.map(({ title, detail, href, cta, icon: Icon }) => <Link className="cc-action-card" href={href} key={title}><span className="cc-action-icon"><Icon size={19} aria-hidden="true" /></span><span><strong>{title}</strong><small>{detail}</small></span><em>{cta}<ArrowRight size={15} aria-hidden="true" /></em></Link>)}</div></section>

  </div>;
}
