'use client';
import { Database, ShieldCheck, MailCheck, Clock3, Server, Lock } from 'lucide-react';
import { useAdmin } from './admin-layout';
import { formatDate } from '@/lib/admin/helpers';
export function SystemHealthPanel() {
  const { snapshot, state } = useAdmin();
  const health = snapshot.health;
  const rows = [
    { label: 'Firebase connection', value: health.connection, icon: Server },
    { label: 'Database status', value: health.database, icon: Database },
    { label: 'Email verification', value: health.emailVerification, icon: MailCheck },
    { label: 'Database rules', value: health.rules, icon: ShieldCheck },
    { label: 'Last statistics sync', value: health.lastSync ? formatDate(health.lastSync) : null, icon: Clock3 },
  ];
  return <section className="rr-panel rr-health" aria-labelledby="health-heading"><div className="rr-panel-heading"><div><h2 id="health-heading">System health</h2><p>Connection and account status</p></div><ShieldCheck size={19} aria-hidden="true" /></div><dl>{rows.map(row => <div key={row.label}><dt><row.icon size={16} aria-hidden="true" />{row.label}</dt><dd>{state === 'loading' ? 'Checking…' : row.value ?? 'Unavailable'}</dd></div>)}</dl><div className="rr-safety-note"><Lock size={16} aria-hidden="true" /><p>Keep donor information private. Access only what your role requires.</p></div><div className="rr-version"><span>Application version</span><span>{health.version ?? 'Unavailable'}</span></div></section>;
}
