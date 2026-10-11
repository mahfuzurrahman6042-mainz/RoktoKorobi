export function formatCount(value: number | null): string {
  return value === null ? '—' : new Intl.NumberFormat('en-BD').format(value);
}
export function formatDate(value: string | null): string {
  if (!value || Number.isNaN(new Date(value).getTime())) return 'Unavailable';
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Dhaka' }).format(new Date(value));
}
export function filterRecords<T extends { status: string }>(records: T[], query: string, status: string, searchable: (row: T) => string): T[] {
  const normalized = query.trim().toLocaleLowerCase();
  return records.filter(row => (status === 'all' || row.status === status) && searchable(row).toLocaleLowerCase().includes(normalized));
}
export function safeReferralUrl(value: string | undefined): string | null {
  if (!value) return null;
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password ? url.href : null; } catch { return null; }
}
export function distributionValues(values: Array<number | null>): { total: number; percentages: number[] } | null {
  if (values.some(v => v === null || !Number.isFinite(v) || v < 0)) return null;
  const counts = values as number[];
  const total = counts.reduce((sum, value) => sum + value, 0);
  return { total, percentages: counts.map(value => total === 0 ? 0 : value / total * 100) };
}
