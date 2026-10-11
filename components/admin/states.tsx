import { AlertCircle, Inbox, Lock } from 'lucide-react';
export function EmptyState({ title = 'No data yet', description = 'Records will appear here when they are available.' }: { title?: string; description?: string }) {
  return <div className="rr-empty"><Inbox size={24} strokeWidth={1.5} aria-hidden="true" /><strong>{title}</strong><p>{description}</p></div>;
}
export function ErrorState({ retry }: { retry?: () => void }) {
  return <div className="rr-empty" role="alert"><AlertCircle size={24} aria-hidden="true" /><strong>Unable to load this information</strong><p>Check your connection and try again.</p>{retry && <button className="rr-button" onClick={retry}>Try again</button>}</div>;
}
export function PermissionDenied() {
  return <section className="rr-permission"><Lock size={28} aria-hidden="true" /><h1>Super Admin access required</h1><p>This page is not available without an authorized Super Admin session.</p></section>;
}
export function LoadingSkeleton({ rows = 3 }: { rows?: number }) {
  return <div className="rr-loading" role="status" aria-label="Loading information"><span className="rr-sr-only">Loading information</span>{Array.from({ length: rows }, (_, index) => <span className="rr-skeleton" key={index} />)}</div>;
}
