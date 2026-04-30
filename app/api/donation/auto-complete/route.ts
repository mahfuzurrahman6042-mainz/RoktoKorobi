import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Verify this is a cron job (add secret check in production)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date().toISOString();

    // Find donations that should auto-complete
    const { data: donations, error: fetchError } = await supabase
      .from('blood_requests')
      .select('*')
      .eq('dispute_raised', false)
      .neq('status', 'completed')
      .neq('status', 'cancelled')
      .not('auto_complete_at', 'is', null)
      .lte('auto_complete_at', now);

    if (fetchError) {
      console.error('Failed to fetch donations for auto-complete:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch donations' }, { status: 500 });
    }

    if (!donations || donations.length === 0) {
      return NextResponse.json({ message: 'No donations to auto-complete', count: 0 });
    }

    let completedCount = 0;

    for (const donation of donations) {
      // Mark as completed
      const { error: completeError } = await supabase
        .from('blood_requests')
        .update({
          status: 'completed',
          completed_at: now,
          auto_complete_at: null
        })
        .eq('id', donation.id);

      if (completeError) {
        console.error(`Failed to auto-complete donation ${donation.id}:`, completeError);
        continue;
      }

      // Clear donor's live location and update stats
      if (donation.donor_id) {
        await supabase
          .from('donor_live_location')
          .delete()
          .eq('donor_id', donation.donor_id);

        // Fetch current donation count
        const { data: profile } = await supabase
          .from('profiles')
          .select('total_donations')
          .eq('id', donation.donor_id)
          .single();

        // Update donor profile
        await supabase
          .from('profiles')
          .update({
            total_donations: (profile?.total_donations || 0) + 1,
            last_donated_at: now,
            is_available: false,
            current_lat: null,
            current_lon: null,
            is_gps_active: false
          })
          .eq('id', donation.donor_id);
      }

      completedCount++;
    }

    return NextResponse.json({ 
      message: `Auto-completed ${completedCount} donations`,
      count: completedCount 
    });
  } catch (error) {
    console.error('Error in auto-complete:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
