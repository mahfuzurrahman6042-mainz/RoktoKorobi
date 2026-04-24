import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { donorId, lat, lng, timestamp } = body;

    // Validate required fields
    if (!donorId || lat === undefined || lng === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: donorId, lat, lng' },
        { status: 400 }
      );
    }

    // Validate coordinates
    if (typeof lat !== 'number' || typeof lng !== 'number' ||
        lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json(
        { error: 'Invalid coordinates' },
        { status: 400 }
      );
    }

    // Upsert donor location
    const { error } = await supabase
      .from('donor_live_location')
      .upsert({
        donor_id: donorId,
        lat: lat,
        lng: lng,
        updated_at: new Date(timestamp || Date.now()).toISOString()
      }, {
        onConflict: 'donor_id'
      });

    if (error) {
      console.error('Failed to update donor location:', error);
      return NextResponse.json(
        { error: 'Failed to update location' },
        { status: 500 }
      );
    }

    // Also update donor's current location in profiles table
    await supabase
      .from('profiles')
      .update({
        current_lat: lat,
        current_lon: lng,
        is_gps_active: true
      })
      .eq('id', donorId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in donor-location update:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
