'use client';
import { useId, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import type { LoadState } from '@/lib/admin/types';
import { filterRecords } from '@/lib/admin/helpers';
import { EmptyState, ErrorState, LoadingSkeleton } from './states';

export interface TableColumn<T> { label: string; render: (row: T) => ReactNode; numeric?: boolean }
export function DataTable<T extends { id: string; status: string }>({ title, records, columns, searchable, statuses, state, retry, initialStatus = 'all', compact = false }: { title: string; records: T[]; columns: TableColumn<T>[]; searchable: (row: T) => string; statuses: string[]; state: LoadState; retry: () => void; initialStatus?: string; compact?: boolean }) {
  const id = useId();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState(initialStatus);
  const [page, setPage] = useState(1);
  const rows = filterRecords(records, query, status, searchable);
  const pageSize = compact ? 5 : 10;
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visible = rows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  return <section className="rr-panel rr-table-panel" aria-labelledby={`${id}-heading`}>
    <div className="rr-panel-heading"><div><h2 id={`${id}-heading`}>{title}</h2><p>{state === 'ready' ? 'Latest available records' : 'Live records will appear after integration'}</p></div><span className="rr-small-label">{state === 'ready' ? `${records.length} records` : 'Awaiting sync'}</span></div>
    <div className="rr-table-toolbar"><label className="rr-search" htmlFor={`${id}-search`}><Search size={16} aria-hidden="true" /><span className="rr-sr-only">Search {title.toLowerCase()}</span><input id={`${id}-search`} type="search" placeholder={`Search ${title.toLowerCase()}…`} value={query} onChange={event => { setQuery(event.target.value); setPage(1); }} /></label><label className="rr-filter"><span className="rr-sr-only">Filter by status</span><select aria-label={`Filter ${title.toLowerCase()} by status`} value={status} onChange={event => { setStatus(event.target.value); setPage(1); }}><option value="all">All statuses</option>{statuses.map(value => <option key={value} value={value}>{value.charAt(0).toUpperCase() + value.slice(1)}</option>)}</select></label></div>
    <div className="rr-table-scroll" role="region" aria-label={`${title} table`} tabIndex={0}><table><caption className="rr-sr-only">{title}. Dates and times use Bangladesh Standard Time.</caption><thead><tr>{columns.map(column => <th scope="col" key={column.label} className={column.numeric ? 'rr-number' : ''}>{column.label}</th>)}</tr></thead><tbody>{state === 'ready' && visible.map(row => <tr key={row.id}>{columns.map(column => <td key={column.label} className={column.numeric ? 'rr-number' : ''}>{column.render(row)}</td>)}</tr>)}{(state !== 'ready' || visible.length === 0) && <tr><td colSpan={columns.length}>{state === 'loading' ? <LoadingSkeleton /> : state === 'error' ? <ErrorState retry={retry} /> : <EmptyState title={state === 'unconfigured' ? 'Awaiting live data' : query || status !== 'all' ? 'No matching records' : 'No records yet'} description={state === 'unconfigured' ? 'No records have been loaded in this preview.' : query || status !== 'all' ? 'Try another search or status filter.' : 'New records will appear here when available.'} />}</td></tr>}</tbody></table></div>
    <div className="rr-table-footer"><span role="status">{state === 'ready' ? `${rows.length ? (currentPage - 1) * pageSize + 1 : 0}–${Math.min(currentPage * pageSize, rows.length)} of ${rows.length}` : 'No live records loaded'}</span><div className="rr-pagination"><button className="rr-icon-button" aria-label="Previous page" disabled={currentPage === 1 || state !== 'ready'} onClick={() => setPage(currentPage - 1)}><ChevronLeft size={17} /></button><span>Page {currentPage}</span><button className="rr-icon-button" aria-label="Next page" disabled={currentPage === pageCount || state !== 'ready'} onClick={() => setPage(currentPage + 1)}><ChevronRight size={17} /></button></div></div>
  </section>;
}
