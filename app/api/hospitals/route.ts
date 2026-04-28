import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const district = searchParams.get('district');
    const city = searchParams.get('city');
    const bloodBank = searchParams.get('bloodBank');
    const donationCenter = searchParams.get('donationCenter');

    // Build query
    let query = supabase
      .from('hospitals')
      .select('*')
      .eq('verified', true);

    // Filter by district if provided
    if (district) {
      query = query.ilike('district', `%${district}%`);
    }

    // Filter by city if provided
    if (city) {
      query = query.ilike('city', `%${city}%`);
    }

    // Filter by blood bank availability
    if (bloodBank === 'true') {
      query = query.eq('blood_bank_available', true);
    }

    // Filter by donation center availability
    if (donationCenter === 'true') {
      query = query.eq('has_donation_center', true);
    }

    const { data: hospitals, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch hospitals' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      hospitals: hospitals || [],
      count: hospitals?.length || 0
    });
  } catch (error) {
    console.error('Error fetching hospitals:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
