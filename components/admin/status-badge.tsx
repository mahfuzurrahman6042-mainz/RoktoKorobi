export function StatusBadge({ status }: { status: string }) {
  const tone = ['active', 'verified', 'fulfilled', 'completed'].includes(status) ? 'teal' : ['pending', 'open', 'unverified'].includes(status) ? 'warning' : ['suspended', 'rejected'].includes(status) ? 'red' : 'neutral';
  return <span className={`rr-badge rr-badge-${tone}`}><span aria-hidden="true" className="rr-dot" />{status.replaceAll('-', ' ')}</span>;
}
