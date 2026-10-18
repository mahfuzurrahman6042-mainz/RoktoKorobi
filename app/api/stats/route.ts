import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const databaseUrl = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;
    if (!databaseUrl) throw new Error('Database URL is not configured');
    const response = await fetch(`${databaseUrl.replace(/\/$/, '')}/publicStats.json`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Public stats read failed: ${response.status}`);
    const stats = await response.json();
    if (!stats || !['users', 'donors', 'requestsFulfilled', 'partners', 'updatedAt'].every(key => Number.isFinite(stats[key]) && stats[key] >= 0)) {
      throw new Error('Public stats have not been published');
    }
    return NextResponse.json({
      registered_users: stats.users,
      registered_donors: stats.donors,
      blood_requests_fulfilled: stats.requestsFulfilled,
      partner_organizations: stats.partners,
      updated_at: stats.updatedAt,
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json(
      { error: 'Current statistics are unavailable' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
