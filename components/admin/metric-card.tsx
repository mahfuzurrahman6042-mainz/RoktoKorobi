import type { LucideIcon } from 'lucide-react';
import { formatCount } from '@/lib/admin/helpers';
import type { LoadState } from '@/lib/admin/types';
export function MetricCard({ label, value, description, icon: Icon, state, tone = 'neutral' }: { label: string; value: number | null; description: string; icon: LucideIcon; state: LoadState; tone?: 'red' | 'teal' | 'neutral' }) {
  const unavailable = state === 'error' ? 'Unavailable' : state === 'forbidden' ? 'Access restricted' : 'Awaiting sync';
  return <article className={`rr-metric rr-metric-${tone}`} aria-label={`${label}: ${state === 'ready' && value !== null ? formatCount(value) : unavailable}`} aria-busy={state === 'loading'}>
    <div className="rr-metric-label"><span>{label}</span><Icon size={17} strokeWidth={1.7} aria-hidden="true" /></div>
    {state === 'loading' ? <span className="rr-skeleton rr-value-skeleton" /> : <div className="rr-metric-value">{state === 'ready' ? formatCount(value) : '—'}</div>}
    <p>{state === 'ready' && value !== null ? description : state === 'loading' ? 'Loading…' : unavailable}</p>
  </article>;
}
