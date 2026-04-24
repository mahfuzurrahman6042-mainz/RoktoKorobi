import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ donorId: string }> }
) {
  try {
    const { donorId } = await params;

    if (!donorId) {
      return NextResponse.json(
        { error: 'Donor ID required' },
        { status: 400 }
      );
    }

    // Fetch donor live location
    const { data: location, error } = await supabase
      .from('donor_live_location')
      .select('donor_id, lat, lng, updated_at')
      .eq('donor_id', donorId)
      .single();

    if (error || !location) {
      return NextResponse.json(
        { error: 'Donor location not found' },
        { status: 404 }
      );
    }

    // Fetch donor's blood group and status (privacy-safe info only)
    const { data: donor } = await supabase
      .from('profiles')
      .select('blood_group, is_available')
      .eq('id', donorId)
      .single();

    // Return ONLY safe information - no phone, name, address
    return NextResponse.json({
      donorId: location.donor_id,
      lat: location.lat,
      lng: location.lng,
      timestamp: location.updated_at,
      bloodGroup: donor?.blood_group,
      status: donor?.is_available ? 'available' : 'unavailable'
    });
  } catch (error) {
    console.error('Error fetching donor location:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
