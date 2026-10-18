'use client';

import Link from 'next/link';
import { Activity, ArrowRight, Building2, AlertTriangle as CircleAlert, Droplet, FileText, Heart, MessageSquare, Network, Plus, RefreshCw, Settings2, ShieldCheck, Users } from 'lucide-react';
import { useAdmin } from './admin-layout';
import { formatCount } from '@/lib/admin/helpers';

type SectionKey = 'people' | 'operations' | 'partners' | 'content' | 'settings';
type Item = { title: string; description: string; href: string; icon: typeof Users };

const config: Record<SectionKey, { eyebrow: string; title: string; description: string; action: Item; links: Item[] }> = {
  people: { eyebrow: 'Community & access', title: 'People', description: 'A clear view of the people powering every donation and every response.', action: { title: 'Open user management', description: 'View full profiles and account controls.', href: '/super-admin/people/users', icon: Users }, links: [
    { title: 'User management', description: 'Search accounts and manage profiles.', href: '/super-admin/people/users', icon: Users },
    { title: 'Admins and roles', description: 'Control administrative access.', href: '/super-admin/people/admins', icon: ShieldCheck },
  ] },
  operations: { eyebrow: 'Platform operations', title: 'Requests', description: 'Track blood requests and move quickly to the cases needing attention.', action: { title: 'Open request management', description: 'Review and manage all blood requests.', href: '/super-admin/operations/requests', icon: Droplet }, links: [
    { title: 'Blood requests', description: 'Review status and request details.', href: '/super-admin/operations/requests', icon: Droplet },
    { title: 'Activity log', description: 'See recorded platform activity.', href: '/super-admin/overview/activity', icon: Activity },
  ] },
  partners: { eyebrow: 'Institution network', title: 'Partners', description: 'Bring institutions on board and keep partner status easy to follow.', action: { title: 'Activate a partner', description: 'Create an institution and referral link.', href: '/super-admin/partner-onboard', icon: Plus }, links: [
    { title: 'Organization requests', description: 'Review and respond to partner applications.', href: '/super-admin/partner-applications', icon: Building2 },
    { title: 'Partner control', description: 'Review institutions, status and referrals.', href: '/super-admin/partner-control', icon: Building2 },
    { title: 'Activate a partner', description: 'Onboard a verified institution leader.', href: '/super-admin/partner-onboard', icon: Plus },
    { title: 'Hospitals', description: 'Manage hospital partners.', href: '/super-admin/partners/hospitals', icon: Network },
  ] },
  content: { eyebrow: 'Public experience', title: 'Content', description: 'Keep the information people rely on accurate, useful and welcoming.', action: { title: 'Manage blog posts', description: 'Create or publish a public update.', href: '/super-admin/content/blog', icon: FileText }, links: [
    { title: 'Blog posts', description: 'Create, edit and publish stories.', href: '/super-admin/content/blog', icon: FileText },
    { title: 'Testimonials', description: 'Review public testimonials.', href: '/super-admin/content/testimonials', icon: MessageSquare },
  ] },
  settings: { eyebrow: 'Administration', title: 'Settings', description: 'Keep access, configuration and system visibility in one place.', action: { title: 'Open platform settings', description: 'Review the current configuration.', href: '/super-admin/settings/platform', icon: Settings2 }, links: [
    { title: 'Platform settings', description: 'Review configuration.', href: '/super-admin/settings/platform', icon: Settings2 },
    { title: 'Roles', description: 'Manage administrator roles.', href: '/super-admin/settings/roles', icon: ShieldCheck },
    { title: 'Permissions', description: 'Review access granted to each role.', href: '/super-admin/settings/permissions', icon: Users },
  ] },
};

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

    {section === 'partners' && <aside className="cc-section cc-note" aria-label="Onboarding process"><CircleAlert size={18} aria-hidden="true" /><p><strong>Partner onboarding</strong>Leaders create and verify their own account first. Review their application, then activate the organization and its referral link.</p></aside>}

    {section === 'settings' && <section className="cc-section" aria-labelledby="health-heading"><div className="cc-section-heading"><div><p className="cc-eyebrow">System status</p><h2 id="health-heading">Connection details</h2></div></div><div className="cc-status-grid">{([['Connection', snapshot.health.connection], ['Database', snapshot.health.database], ['Email verification', snapshot.health.emailVerification], ['Rules', snapshot.health.rules], ['Last sync', snapshot.health.lastSync], ['Version', snapshot.health.version]] as const).map(([label, value]) => <div className="cc-status-item" key={label}><span>{label}</span><strong>{ready ? value || 'Not reported' : 'Unavailable'}</strong></div>)}</div></section>}

    <section className="cc-section" aria-labelledby="tools-heading"><div className="cc-section-heading"><div><p className="cc-eyebrow">Workspace tools</p><h2 id="tools-heading">Continue your work</h2></div></div><div className="cc-action-grid">{content.links.map(({ title, description, href, icon: Icon }) => <Link className="cc-action-card" key={href} href={href}><span className="cc-action-icon"><Icon size={19} aria-hidden="true" /></span><span><strong>{title}</strong><small>{description}</small></span><em>Open <ArrowRight size={15} aria-hidden="true" /></em></Link>)}</div></section>
  </div>;
}
