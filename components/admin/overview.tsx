'use client';
import { Users, UserCheck, HeartHandshake, Building2, Clock3, Droplet, CheckCircle, User, GraduationCap, Server, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { useAdmin } from './admin-layout';
import { MetricCard } from './metric-card';
import { PartnerSummary } from './partner-summary';
import { SystemHealthPanel } from './system-health-panel';
import { ActivityTable } from './activity-table';
import { OperationalSummaries } from './operational-summaries';
import { QuickActions } from './quick-actions';
import type { MetricKey } from '@/lib/admin/types';
import { ErrorState } from './states';
const metrics = [
  { key: 'users', label: 'Registered users', description: 'Total platform registrations', icon: Users, tone: 'neutral' },
  { key: 'verifiedUsers', label: 'Verified users', description: 'Verification completed', icon: UserCheck, tone: 'teal' },
  { key: 'donors', label: 'Active donors', description: 'Available in your network', icon: HeartHandshake, tone: 'red' },
  { key: 'partners', label: 'Active partners', description: 'Participating institutions', icon: Building2, tone: 'teal' },
  { key: 'pendingPartners', label: 'Pending approvals', description: 'Partner applications to review', icon: Clock3, tone: 'neutral' },
  { key: 'requests', label: 'Blood requests', description: 'Total requests received', icon: Droplet, tone: 'red' },
  { key: 'fulfilledRequests', label: 'Fulfilled requests', description: 'Requests marked fulfilled', icon: CheckCircle, tone: 'teal' },
  { key: 'delegates', label: 'Active delegates', description: 'Supporting your network', icon: User, tone: 'neutral' },
  { key: 'students', label: 'Students reached', description: 'Through partner referrals', icon: GraduationCap, tone: 'neutral' },
] as const;
export function Overview() {
  const { snapshot, state, reload } = useAdmin();
  return <><div className="rr-page-heading"><div><div className="rr-eyebrow">Platform overview</div><h1>One network. Every life matters.</h1><p>Your people, partners, and requests — in one place.</p></div><Link className="rr-button" href="/super-admin/preview/activity">View activity log <ArrowUpRight size={16} aria-hidden="true" /></Link></div>
    {state === 'error' && <ErrorState retry={reload} />}
    <section className="rr-metrics" aria-label="Platform metrics">{metrics.map(metric => <MetricCard key={metric.key} label={metric.label} description={metric.description} icon={metric.icon} tone={metric.tone} value={snapshot.metrics[metric.key as MetricKey]} state={state} />)}<article className="rr-metric"><div className="rr-metric-label"><span>System status</span><Server size={17} aria-hidden="true" /></div><div className="rr-system-value"><span className="rr-dot" aria-hidden="true" />{state === 'loading' ? 'Checking…' : snapshot.health.connection ?? 'Not connected'}</div><p>{snapshot.health.lastSync ? 'Sync details below' : 'Awaiting first sync'}</p></article></section>
    <PartnerSummary />
    <div className="rr-bottom-grid"><div className="rr-stack"><ActivityTable compact /><QuickActions /></div><div className="rr-stack"><SystemHealthPanel /><OperationalSummaries /></div></div>
  </>;
}
