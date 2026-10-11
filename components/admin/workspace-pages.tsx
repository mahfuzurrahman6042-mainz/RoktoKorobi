'use client';
import Link from 'next/link';
import { ArrowUpRight, Info, UserPlus } from 'lucide-react';
import { useAdmin } from './admin-layout';
import { DataTable } from './data-table';
import { StatusBadge } from './status-badge';
import { PartnerSummary, ReferralCopy } from './partner-summary';
import { ActivityTable } from './activity-table';
import { SystemHealthPanel } from './system-health-panel';
import { OperationalSummaries } from './operational-summaries';
import { EmptyState } from './states';
import { formatCount, formatDate } from '@/lib/admin/helpers';
import { navigation } from './navigation';

export function PageHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <div className="rr-page-heading"><div><div className="rr-eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div></div>;
}
export function PartnersTable({ initialStatus = 'all' }: { initialStatus?: string }) {
  const { state, snapshot, reload } = useAdmin();
  return <DataTable key={initialStatus} title="Partner institutions" records={snapshot.partners} state={state} retry={reload} initialStatus={initialStatus} searchable={row => `${row.name} ${row.district}`} statuses={['active', 'pending', 'suspended']} columns={[
    { label: 'Institution', render: row => <strong>{row.name}</strong> },
    { label: 'District', render: row => row.district },
    { label: 'Status', render: row => <StatusBadge status={row.status} /> },
    { label: 'Students reached', numeric: true, render: row => formatCount(row.students) },
    { label: 'Activated (BDT)', render: row => formatDate(row.activatedAt) },
    { label: 'Referral', render: row => <ReferralCopy url={row.referralUrl} /> },
  ]} />;
}
export function PartnersPage({ initialStatus = 'all' }: { initialStatus?: string }) {
  return <><PageHeading eyebrow="Partner operations" title="Partner institutions" description="A clear view of your institutional network." /><div className="rr-page-actions"><Link className="rr-button rr-button-primary" href="/super-admin/partner-onboard"><UserPlus size={16} aria-hidden="true" />Activate new partner</Link><Link className="rr-button" href="/super-admin/partner-control">Partner control center <ArrowUpRight size={15} aria-hidden="true" /></Link></div><PartnersTable initialStatus={initialStatus} /></>;
}
export function PartnerControlPage() { return <><PageHeading eyebrow="Partner operations" title="Partner control center" description="Coordinate applications, institution status, and referral activity." /><PartnerSummary /><div className="rr-stack"><PartnersTable /><ActivityTable /></div></>; }
export function OnboardPage() {
  return <><PageHeading eyebrow="Partner operations" title="Activate a new partner" description="Connect an institution to the Roktokorbi network." /><section className="rr-panel rr-onboard"><div className="rr-inline-note"><Info size={18} aria-hidden="true" /><p>Activation is unavailable in this design preview. Your existing onboarding and approval workflow must be connected before any records can be saved.</p></div><fieldset disabled><legend>Institution details</legend><div className="rr-form-grid"><label>Institution name<input placeholder="Institution name" /></label><label>Institution type<select defaultValue=""><option value="">Select a type</option></select></label><label>District<input placeholder="District" /></label><label>Institution contact email<input type="email" placeholder="Institution email" /></label></div><label className="rr-full-label">Administrative notes<textarea placeholder="Operational notes only. Do not include donor medical information." rows={3} /></label><button disabled className="rr-button rr-button-primary"><UserPlus size={16} aria-hidden="true" />Activate partner — unavailable</button></fieldset><Link className="rr-text-link" href="/super-admin/partner-institutes">Return to partner institutions</Link></section></>;
}
function UsersPage() {
  const { snapshot, state, reload } = useAdmin();
  return <DataTable title="Users" records={snapshot.users} state={state} retry={reload} searchable={row => `${row.displayName} ${row.district}`} statuses={['verified', 'unverified']} columns={[
    { label: 'User', render: row => <strong>{row.displayName}</strong> },
    { label: 'District', render: row => row.district },
    { label: 'Verification', render: row => <StatusBadge status={row.status} /> },
    { label: 'Joined (BDT)', render: row => formatDate(row.joinedAt) },
  ]} />;
}
function RequestsPage() {
  const { snapshot, state, reload } = useAdmin();
  return <DataTable title="Blood requests" records={snapshot.requests} state={state} retry={reload} searchable={row => `${row.reference} ${row.district} ${row.bloodGroup}`} statuses={['open', 'pending', 'fulfilled']} columns={[
    { label: 'Request reference', render: row => <strong>{row.reference}</strong> },
    { label: 'Blood group', render: row => row.bloodGroup },
    { label: 'District', render: row => row.district },
    { label: 'Status', render: row => <StatusBadge status={row.status} /> },
    { label: 'Created (BDT)', render: row => formatDate(row.createdAt) },
  ]} />;
}
export function PreviewPage({ section }: { section: string }) {
  const label = navigation.flatMap(group => group.items).find(item => item.href === `/super-admin/preview/${section}`)?.label ?? 'Workspace';
  return <><PageHeading eyebrow="Admin workspace" title={label} description="A focused view of your platform operations." />{section === 'users' ? <UsersPage /> : section === 'requests' ? <RequestsPage /> : section === 'activity' ? <ActivityTable /> : section === 'referrals' ? <PartnersTable /> : section === 'reports' ? <OperationalSummaries /> : section === 'settings' ? <SystemHealthPanel /> : <section className="rr-panel"><EmptyState title={`${label} is not connected`} description="This workspace needs your existing route and data helpers. No records or actions are available in the standalone preview." /></section>}</>;
}
