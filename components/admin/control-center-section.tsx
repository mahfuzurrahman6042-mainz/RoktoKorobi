'use client';

import Link from 'next/link';
import { useMemo, useState, type ReactNode } from 'react';
import { Activity, ArrowRight, Building2, AlertTriangle as CircleAlert, Droplet, FileText, Heart, Image, MessageSquare, Network, Plus, RefreshCw, Search, Settings2, ShieldCheck, Users } from 'lucide-react';
import { useAdmin } from './admin-layout';
import { filterRecords, formatCount, formatDate } from '@/lib/admin/helpers';
import type { Partner, RecordStatus, RequestRecord, UserRecord } from '@/lib/admin/types';

type SectionKey = 'people' | 'operations' | 'partners' | 'content' | 'settings';
type Item = { title: string; description: string; href: string; icon: typeof Users };

const config: Record<SectionKey, { eyebrow: string; title: string; description: string; action: Item; links: Item[] }> = {
  people: { eyebrow: 'Community & access', title: 'People', description: 'A clear view of the people powering every donation and every response.', action: { title: 'Open user management', description: 'View full profiles and account controls.', href: '/super-admin/people/users', icon: Users }, links: [
    { title: 'User management', description: 'Search accounts and manage profiles.', href: '/super-admin/people/users', icon: Users },
    { title: 'Roles & permissions', description: 'Control administrative access.', href: '/admin/roles', icon: ShieldCheck },
  ] },
  operations: { eyebrow: 'Platform operations', title: 'Requests', description: 'Track blood requests and move quickly to the cases needing attention.', action: { title: 'Open request management', description: 'Review and manage all blood requests.', href: '/super-admin/operations/requests', icon: Droplet }, links: [
    { title: 'Blood requests', description: 'Review status and request details.', href: '/super-admin/operations/requests', icon: Droplet },
    { title: 'Activity log', description: 'See recorded platform activity.', href: '/super-admin/overview/activity', icon: Activity },
  ] },
  partners: { eyebrow: 'Institution network', title: 'Partners', description: 'Bring institutions on board and keep partner status easy to follow.', action: { title: 'Activate a partner', description: 'Create an institution and referral link.', href: '/super-admin/partner-onboard', icon: Plus }, links: [
    { title: 'Partner control', description: 'Review institutions, status and referrals.', href: '/super-admin/partner-control', icon: Building2 },
    { title: 'Activate a partner', description: 'Onboard a verified institution leader.', href: '/super-admin/partner-onboard', icon: Plus },
    { title: 'Organizations', description: 'Manage registered organizations.', href: '/admin/organizations', icon: Network },
  ] },
  content: { eyebrow: 'Public experience', title: 'Content', description: 'Keep the information people rely on accurate, useful and welcoming.', action: { title: 'Write a blog post', description: 'Create a new public update.', href: '/admin/blogs/new', icon: FileText }, links: [
    { title: 'Blog posts', description: 'Create, edit and publish stories.', href: '/admin/blogs', icon: FileText },
    { title: 'Hospitals', description: 'Maintain hospital information.', href: '/admin/hospitals', icon: Building2 },
    { title: 'Testimonials', description: 'Review public testimonials.', href: '/admin/testimonials', icon: MessageSquare },
    { title: 'Illustrations', description: 'Manage visual content.', href: '/admin/illustrations', icon: Image },
  ] },
  settings: { eyebrow: 'Administration', title: 'Settings', description: 'Keep access, configuration and system visibility in one place.', action: { title: 'Open platform settings', description: 'Review the current configuration.', href: '/admin/settings', icon: Settings2 }, links: [
    { title: 'Platform settings', description: 'Review configuration.', href: '/admin/settings', icon: Settings2 },
    { title: 'Roles', description: 'Manage administrator roles.', href: '/admin/roles', icon: ShieldCheck },
    { title: 'Permissions', description: 'Review page access.', href: '/admin/permissions', icon: Users },
  ] },
};

function Badge({ status }: { status: RecordStatus }) {
  const tone = ['active', 'verified', 'fulfilled', 'completed'].includes(status) ? ' is-green' : ['suspended', 'rejected'].includes(status) ? ' is-red' : '';
  return <span className={'cc-badge' + tone}>{status}</span>;
}

function Records<T extends { id: string; status: RecordStatus }>({ title, rows, searchable, columns, render }: {
  title: string; rows: T[]; searchable: (row: T) => string; columns: string[]; render: (row: T) => ReactNode;
}) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(0);
  const options = useMemo(() => [...new Set(rows.map(row => row.status))].sort(), [rows]);
  const matching = useMemo(() => filterRecords(rows, query, status, searchable), [rows, query, status, searchable]);
  const last = Math.max(0, Math.ceil(matching.length / 10) - 1);
  const current = Math.min(page, last);
  return <section className="cc-section cc-panel" aria-label={title}>
    <div className="cc-panel-heading"><h2>{title}</h2><small>{formatCount(matching.length)} shown</small></div>
    <div className="cc-records-tools"><label className="cc-search"><Search size={17} aria-hidden="true" /><span className="sr-only">Search {title.toLowerCase()}</span><input type="search" value={query} onChange={event => { setQuery(event.target.value); setPage(0); }} placeholder={'Search ' + title.toLowerCase()} /></label><label><span className="sr-only">Filter {title.toLowerCase()} by status</span><select className="cc-filter" value={status} onChange={event => { setStatus(event.target.value); setPage(0); }}><option value="all">All statuses</option>{options.map(option => <option value={option} key={option}>{option}</option>)}</select></label></div>
    {matching.length ? <div className="cc-table-scroll" tabIndex={0} role="region" aria-label={title + ' table, scroll horizontally for more columns'}><table className="cc-table"><caption className="sr-only">{title}</caption><thead><tr>{columns.map(column => <th scope="col" key={column}>{column}</th>)}</tr></thead><tbody>{matching.slice(current * 10, current * 10 + 10).map(row => <tr key={row.id}>{render(row)}</tr>)}</tbody></table></div> : <div className="cc-empty"><Search size={22} aria-hidden="true" /><strong>No matching records</strong><p>{rows.length ? 'Try a different search or status.' : 'No records are available in the current snapshot.'}</p></div>}
    <div className="cc-table-footer"><span>{matching.length ? `Showing ${current * 10 + 1}–${Math.min((current + 1) * 10, matching.length)} of ${matching.length}` : '0 results'}</span><div><button type="button" onClick={() => setPage(value => Math.max(0, value - 1))} disabled={current === 0} aria-label="Previous page">‹</button><span>Page {current + 1} of {last + 1}</span><button type="button" onClick={() => setPage(value => Math.min(last, value + 1))} disabled={current === last} aria-label="Next page">›</button></div></div>
  </section>;
}

const searchUsers = (row: UserRecord) => [row.displayName, row.district, row.status].join(' ');
const searchRequests = (row: RequestRecord) => [row.reference, row.district, row.bloodGroup, row.status].join(' ');
const searchPartners = (row: Partner) => [row.name, row.district, row.status].join(' ');

export function ControlCenterSection({ section }: { section: SectionKey }) {
  const { snapshot, state, reload } = useAdmin();
  const content = config[section];
  const ActionIcon = content.action.icon;
  const ready = state === 'ready';
  const count = (value: number | null) => ready ? formatCount(value) : '—';
  const stats = section === 'people' ? [
    { title: 'Registered users', value: snapshot.metrics.users, icon: Users },
    { title: 'Verified users', value: snapshot.metrics.verifiedUsers, icon: ShieldCheck },
    { title: 'Active donors', value: snapshot.metrics.donors, icon: Heart },
    { title: 'Delegates', value: snapshot.metrics.delegates, icon: Network },
  ] : section === 'operations' ? [
    { title: 'Open requests', value: snapshot.requestStatus.open, icon: Droplet },
    { title: 'Pending requests', value: snapshot.requestStatus.pending, icon: Activity },
    { title: 'Fulfilled', value: snapshot.requestStatus.fulfilled, icon: ShieldCheck },
    { title: 'Total requests', value: snapshot.metrics.requests, icon: Network },
  ] : section === 'partners' ? [
    { title: 'Active partners', value: snapshot.partnerStatus.active, icon: Building2 },
    { title: 'Pending partners', value: snapshot.partnerStatus.pending, icon: Activity },
    { title: 'Suspended', value: snapshot.partnerStatus.suspended, icon: ShieldCheck },
    { title: 'Students reached', value: snapshot.metrics.students, icon: Users },
  ] : section === 'content' ? [
    { title: 'Hospitals', value: snapshot.metrics.hospitals, icon: Building2 },
    { title: 'Blog posts', value: snapshot.metrics.blogs, icon: FileText },
    { title: 'Testimonials', value: snapshot.metrics.testimonials, icon: MessageSquare },
    { title: 'Verified stories', value: snapshot.metrics.verifiedTestimonials, icon: ShieldCheck },
  ] : [];

  return <div className="cc-page">
    <section className="cc-hero" aria-labelledby="section-title"><div><p className="cc-eyebrow">{content.eyebrow}</p><h1 id="section-title">{content.title}</h1><p>{content.description}</p></div><div className="cc-hero-actions"><button className="cc-button" type="button" onClick={() => void reload()} disabled={state === 'loading'}><RefreshCw size={16} aria-hidden="true" />Refresh</button><Link className="cc-button cc-button-primary" href={content.action.href}><ActionIcon size={17} aria-hidden="true" />{content.action.title}</Link></div></section>
    {state !== 'ready' && <div className={'cc-data-message' + (state === 'error' ? ' is-error' : '')} role="status"><CircleAlert size={18} aria-hidden="true" /><span>{state === 'loading' ? 'Loading current platform data…' : state === 'unconfigured' ? 'Data source is not configured.' : 'Current platform data could not be loaded.'}</span>{state === 'error' && <button type="button" onClick={() => void reload()}>Retry</button>}</div>}
    {stats.length > 0 && <section className="cc-section" aria-label={content.title + ' at a glance'}><div className="cc-metrics">{stats.map(({ title, value, icon: Icon }) => <div className="cc-metric" key={title}><span className="cc-metric-top"><span>{title}</span><Icon size={19} aria-hidden="true" /></span><strong>{count(value)}</strong><small>{ready ? 'Current snapshot' : 'Awaiting data'}</small></div>)}</div></section>}

    {section === 'people' && ready && <Records title="People" rows={snapshot.users} searchable={searchUsers} columns={['Person', 'District', 'Status', 'Joined']} render={row => <><td><strong>{row.displayName || 'Unnamed user'}</strong><small>{row.isDonor ? 'Donor' : 'Member'}</small></td><td>{row.district || '—'}</td><td><Badge status={row.status} /></td><td>{formatDate(row.joinedAt)}</td></>} />}
    {section === 'operations' && ready && <Records title="Blood requests" rows={snapshot.requests} searchable={searchRequests} columns={['Reference', 'Blood group', 'District', 'Status', 'Created']} render={row => <><td><strong>{row.reference}</strong></td><td>{row.bloodGroup || '—'}</td><td>{row.district || '—'}</td><td><Badge status={row.status} /></td><td>{formatDate(row.createdAt)}</td></>} />}
    {section === 'partners' && <><aside className="cc-section cc-note" aria-label="Onboarding process"><CircleAlert size={18} aria-hidden="true" /><p><strong>Current onboarding process</strong>The leader creates and verifies a user account first. A super admin then activates the institution. Public partner registration is not accepting submissions yet.</p></aside>{ready && <Records title="Institutions" rows={snapshot.partners} searchable={searchPartners} columns={['Institution', 'District', 'Status', 'Students', 'Activated']} render={row => <><td><strong>{row.name}</strong></td><td>{row.district || '—'}</td><td><Badge status={row.status} /></td><td>{formatCount(row.students)}</td><td>{formatDate(row.activatedAt)}</td></>} />}</>}
    {section === 'settings' && <section className="cc-section" aria-labelledby="health-heading"><div className="cc-section-heading"><div><p className="cc-eyebrow">System status</p><h2 id="health-heading">Connection details</h2></div></div><div className="cc-status-grid">{([['Connection', snapshot.health.connection], ['Database', snapshot.health.database], ['Email verification', snapshot.health.emailVerification], ['Rules', snapshot.health.rules], ['Last sync', snapshot.health.lastSync], ['Version', snapshot.health.version]] as const).map(([label, value]) => <div className="cc-status-item" key={label}><span>{label}</span><strong>{ready ? value || 'Not reported' : 'Unavailable'}</strong></div>)}</div></section>}

    <section className="cc-section" aria-labelledby="tools-heading"><div className="cc-section-heading"><div><p className="cc-eyebrow">Workspace tools</p><h2 id="tools-heading">Continue your work</h2></div></div><div className="cc-action-grid">{content.links.map(({ title, description, href, icon: Icon }) => <Link className="cc-action-card" key={href} href={href}><span className="cc-action-icon"><Icon size={19} aria-hidden="true" /></span><span><strong>{title}</strong><small>{description}</small></span><em>Open <ArrowRight size={15} aria-hidden="true" /></em></Link>)}</div></section>
  </div>;
}
