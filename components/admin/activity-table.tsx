'use client';
import { useAdmin } from './admin-layout';
import { DataTable } from './data-table';
import { StatusBadge } from './status-badge';
import { formatDate } from '@/lib/admin/helpers';
export function ActivityTable({ compact = false }: { compact?: boolean }) {
  const { snapshot, state, reload } = useAdmin();
  return <DataTable title="Recent activity" records={[...snapshot.activities].sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt))} state={state} retry={reload} compact={compact} searchable={row => `${row.type} ${row.description} ${row.relatedLabel}`} statuses={['completed', 'pending', 'rejected']} columns={[
    { label: 'Event', render: row => <div className="rr-cell-title"><strong>{row.type}</strong><span>{row.description}</span></div> },
    { label: 'Related record', render: row => row.relatedLabel || '—' },
    { label: 'Date / time (BDT)', render: row => formatDate(row.occurredAt) },
    { label: 'Status', render: row => <StatusBadge status={row.status} /> },
  ]} />;
}
