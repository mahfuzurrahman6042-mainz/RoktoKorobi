'use client';

import Link from 'next/link';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bell,
  Building2,
  CheckCircle2,
  FileText,
  Heart,
  LayoutDashboard,
  Megaphone,
  Network,
  Plus,
  Settings2,
  ShieldCheck,
  UserPlus,
  Users,
} from 'lucide-react';
import { useAdmin } from './admin-layout';
import { formatCount, formatDate } from '@/lib/admin/helpers';

type CardStatus = 'live' | 'building' | 'planned';

const statusLabel: Record<CardStatus, string> = {
  live: 'Live',
  building: 'In progress',
  planned: 'Not built',
};

const workspaces: Array<{
  title: string;
  description: string;
  href?: string;
  status: CardStatus;
  icon: typeof Users;
}> = [
  { title: 'People', description: 'Donors, volunteers and platform administrators.', href: '/super-admin/people', status: 'live', icon: Users },
  { title: 'Operations', description: 'Blood requests, dispatch and donation records.', href: '/super-admin/operations', status: 'live', icon: Activity },
  { title: 'Partners', description: 'Clubs, organizations, campaigns and referrals.', href: '/super-admin/partners', status: 'live', icon: Building2 },
  { title: 'Content', description: 'Blogs, testimonials, stories and public information.', href: '/super-admin/content', status: 'building', icon: FileText },
  { title: 'Safety', description: 'Abuse reports, messaging safety and admin audit.', status: 'planned', icon: ShieldCheck },
  { title: 'Settings', description: 'Platform configuration, access and integrations.', href: '/super-admin/settings', status: 'building', icon: Settings2 },
];

function Status({ value }: { value: CardStatus }) {
  return <span className={`rr-design-status rr-design-status-${value}`}><i aria-hidden="true" />{statusLabel[value]}</span>;
}

function WorkspaceCard({ workspace }: { workspace: typeof workspaces[number] }) {
  const Icon = workspace.icon;
  const content = <><div className="rr-design-card-top"><div className="rr-design-icon"><Icon size={20} aria-hidden="true" /></div><Status value={workspace.status} /></div><h2>{workspace.title}</h2><p>{workspace.description}</p><span className="rr-design-card-link">{workspace.status === 'live' ? 'Open workspace' : workspace.status === 'building' ? 'View progress' : 'Planned'}<ArrowRight size={16} aria-hidden="true" /></span></>;
  return workspace.href && workspace.status !== 'planned' ? <Link className="rr-design-card" href={workspace.href}>{content}</Link> : <article className="rr-design-card rr-design-card-disabled" aria-disabled="true">{content}</article>;
}

export function SuperAdminDashboard() {
  const { snapshot, state, reload } = useAdmin();
  const pendingPartners = snapshot.metrics.pendingPartners;
  const requests = snapshot.metrics.requests;
  const unresolved = (pendingPartners ?? 0) + (snapshot.requestStatus.pending ?? 0);
  const vitals = [
    { label: 'Registered users', value: snapshot.metrics.users, href: '/super-admin/people', icon: Users },
    { label: 'Active donors', value: snapshot.metrics.donors, href: '/super-admin/people', icon: Heart },
    { label: 'Active partners', value: snapshot.metrics.partners, href: '/super-admin/partners', icon: Building2 },
    { label: 'Open requests', value: snapshot.requestStatus.open, href: '/super-admin/operations', icon: AlertTriangle },
    { label: 'Fulfilled requests', value: snapshot.metrics.fulfilledRequests, href: '/super-admin/operations', icon: CheckCircle2 },
    { label: 'Students reached', value: snapshot.metrics.students, href: '/super-admin/partners', icon: Users },
  ];

  return <div className="rr-design-dashboard">
    <section className="rr-design-welcome">
      <div><p className="rr-design-eyebrow">Super Admin command center</p><h1>Good morning, Super Admin.</h1><p>Here is the state of the RoktoKorobi platform today.</p></div>
      <Link className="rr-design-outline-button" href="/"><LayoutDashboard size={17} aria-hidden="true" />View homepage</Link>
    </section>

    <section className="rr-design-attention" aria-labelledby="attention-heading">
      <div className="rr-design-section-heading"><div><p className="rr-design-eyebrow">Needs attention</p><h2 id="attention-heading">The next important actions</h2></div><button className="rr-design-text-button" onClick={() => void reload()}>Refresh data</button></div>
      <div className="rr-design-attention-grid">
        <Link href="/super-admin/operations" className="rr-design-attention-item"><AlertTriangle size={19} aria-hidden="true" /><span><strong>{formatCount(snapshot.requestStatus.open)} open blood requests</strong><small>Review urgency and matched donors.</small></span><ArrowRight size={16} aria-hidden="true" /></Link>
        <Link href="/super-admin/partners" className="rr-design-attention-item"><Building2 size={19} aria-hidden="true" /><span><strong>{formatCount(pendingPartners)} partner applications</strong><small>Review organizations waiting for approval.</small></span><ArrowRight size={16} aria-hidden="true" /></Link>
        <Link href="/super-admin/people" className="rr-design-attention-item"><UserPlus size={19} aria-hidden="true" /><span><strong>{formatCount(snapshot.metrics.verifiedUsers)} verified users</strong><small>Manage the people powering the network.</small></span><ArrowRight size={16} aria-hidden="true" /></Link>
      </div>
      {state !== 'ready' && <p className="rr-design-note">Live data is {state === 'loading' ? 'loading' : 'not connected yet'}; values will update after the Firebase sync.</p>}
    </section>

    <section className="rr-design-section" aria-labelledby="vitals-heading"><div className="rr-design-section-heading"><div><p className="rr-design-eyebrow">Platform vitals</p><h2 id="vitals-heading">A live pulse on the network</h2></div><span className="rr-design-sync"><i aria-hidden="true" />{snapshot.health.connection ?? 'Awaiting sync'}</span></div><div className="rr-design-vitals">{vitals.map(({ label, value, href, icon: Icon }) => <Link key={label} href={href} className="rr-design-vital"><span className="rr-design-icon"><Icon size={19} aria-hidden="true" /></span><strong>{state === 'loading' ? '—' : formatCount(value)}</strong><span>{label}</span></Link>)}</div></section>

    <section className="rr-design-section" aria-labelledby="workspace-heading"><div className="rr-design-section-heading"><div><p className="rr-design-eyebrow">Workspaces</p><h2 id="workspace-heading">Run every part of the platform</h2></div></div><div className="rr-design-workspaces">{workspaces.map(workspace => <WorkspaceCard key={workspace.title} workspace={workspace} />)}</div></section>

    <section className="rr-design-section" aria-labelledby="quick-heading"><div className="rr-design-section-heading"><div><p className="rr-design-eyebrow">Quick actions</p><h2 id="quick-heading">Get to the work faster</h2></div></div><div className="rr-design-quick-grid"><Link href="/super-admin/partner-onboard"><span className="rr-design-icon"><Plus size={20} aria-hidden="true" /></span><span><strong>Activate a partner</strong><small>Create an organization and referral link.</small></span><ArrowRight size={16} aria-hidden="true" /></Link><Link href="/admin/organizations"><span className="rr-design-icon"><Building2 size={20} aria-hidden="true" /></span><span><strong>Manage organizations</strong><small>Review registered platform organizations.</small></span><ArrowRight size={16} aria-hidden="true" /></Link><Link href="/admin/blogs/new"><span className="rr-design-icon"><FileText size={20} aria-hidden="true" /></span><span><strong>Write a blog post</strong><small>Share news, guidance or donor stories.</small></span><ArrowRight size={16} aria-hidden="true" /></Link><Link href="/super-admin/operations"><span className="rr-design-icon"><Megaphone size={20} aria-hidden="true" /></span><span><strong>Review requests</strong><small>{formatCount(requests)} total blood requests in the network.</small></span><ArrowRight size={16} aria-hidden="true" /></Link></div></section>

    <section className="rr-design-section rr-design-activity" aria-labelledby="activity-heading"><div className="rr-design-section-heading"><div><p className="rr-design-eyebrow">Recent activity</p><h2 id="activity-heading">What changed most recently</h2></div><Link className="rr-design-text-button" href="/super-admin/operations">View all <ArrowRight size={15} aria-hidden="true" /></Link></div>{snapshot.activities.length ? <div className="rr-design-activity-list">{snapshot.activities.slice(0, 5).map(activity => <div className="rr-design-activity-row" key={activity.id}><span className="rr-design-activity-dot" /><div><strong>{activity.type}</strong><small>{activity.description} · {activity.relatedLabel}</small></div><time>{formatDate(activity.occurredAt)}</time></div>)}</div> : <div className="rr-design-empty"><Activity size={22} aria-hidden="true" /><strong>No recent activity yet</strong><p>Actions across users, hospitals, requests and partners will appear here.</p></div>}</section>
    <p className="rr-design-footer-note">RoktoKorobi · Built around people. Designed for care.</p>
  </div>;
}
