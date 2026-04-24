import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { donorId } = body;

    if (!donorId) {
      return NextResponse.json(
        { error: 'Donor ID required' },
        { status: 400 }
      );
    }

    // Delete donor's live location
    const { error } = await supabase
      .from('donor_live_location')
      .delete()
      .eq('donor_id', donorId);

    if (error) {
      console.error('Failed to clear donor location:', error);
      return NextResponse.json(
        { error: 'Failed to clear location' },
        { status: 500 }
      );
    }

    // Update donor's profile to clear GPS status
    await supabase
      .from('profiles')
      .update({
        current_lat: null,
        current_lon: null,
        is_gps_active: false
      })
      .eq('id', donorId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing donor location:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
