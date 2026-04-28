import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { leaderboardCache, CACHE_KEYS, CACHE_DURATION } from '@/lib/cache';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const district = searchParams.get('district');
    const limit = searchParams.get('limit') || '50';
    const bypassCache = searchParams.get('bypassCache') === 'true';

    // Generate cache key
    const cacheKey = district 
      ? CACHE_KEYS.LEADERBOARD_BY_DISTRICT(district)
      : CACHE_KEYS.LEADERBOARD;

    // Check cache first
    if (!bypassCache) {
      const cached = leaderboardCache.get(cacheKey);
      if (cached) {
        return NextResponse.json({
          ...cached,
          cached: true
        });
      }
    }

    // Build query for leaderboard
    let query = supabase
      .from('profiles')
      .select('id, name, blood_group, location, total_donations, last_donation_date')
      .eq('is_donor', true)
      .gt('total_donations', 0)
      .order('total_donations', { ascending: false })
      .limit(parseInt(limit));

    // Filter by district if provided
    if (district) {
      query = query.ilike('location', `%${district}%`);
    }

    const { data: donors, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch leaderboard' },
        { status: 500 }
      );
    }

    // Add rank to each donor
    const rankedDonors = (donors || []).map((donor, index) => ({
      ...donor,
      rank: index + 1
    }));

    const result = {
      donors: rankedDonors,
      count: rankedDonors.length,
      filter: district || 'all'
    };

    // Cache the result
    leaderboardCache.set(cacheKey, result, CACHE_DURATION.LONG);

    return NextResponse.json({
      ...result,
      cached: false
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
