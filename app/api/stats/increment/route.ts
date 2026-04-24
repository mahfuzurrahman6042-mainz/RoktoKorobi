import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { parseSessionCookie, verifySessionToken } from '@/lib/auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie');
    
    // Validate session
    const sessionToken = parseSessionCookie(cookieHeader);
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from session using our custom JWT verification
    const user = await verifySessionToken(sessionToken);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is authenticated (allow any authenticated user to increment stats)
    // Stats are typically incremented by the registration process, so this is fine
    const body = await request.json();
    const { type, district } = body;

    if (!type || (type !== 'donor' && type !== 'lives_saved' && type !== 'district')) {
      return NextResponse.json(
        { error: 'Invalid type. Must be donor, lives_saved, or district' },
        { status: 400 }
      );
    }

    let updateData: any = {};
    
    if (type === 'donor') {
      updateData = { verified_donors: 'verified_donors + 1' };
    } else if (type === 'lives_saved') {
      updateData = { lives_saved: 'lives_saved + 1' };
    } else if (type === 'district') {
      // For districts, we need to count unique districts from donors table
      const { data: donors, error: donorsError } = await supabase
        .from('donors')
        .select('district')
        .not('district', 'is', null);
      
      if (donorsError) {
        return NextResponse.json(
          { error: 'Failed to fetch donors for district count' },
          { status: 500 }
        );
      }
      
      // Count unique districts
      const uniqueDistricts = new Set(donors?.map(d => d.district) || []);
      updateData = { districts_covered: uniqueDistricts.size };
    }

    // Update stats
    const { data, error } = await supabase
      .from('stats')
      .update(updateData)
      .eq('id', 1)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update stats' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to increment stats' },
      { status: 500 }
    );
  }
}
