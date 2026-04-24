import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Find donations that are in 'arrived' status and haven't been confirmed after 30 minutes
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();

    const { data: donations, error } = await supabase
      .from('blood_requests')
      .select('*')
      .eq('status', 'arrived')
      .lt('geofence_triggered_at', thirtyMinutesAgo)
      .or('donor_confirmed.eq.false,recipient_confirmed.eq.false');

    if (error) {
      console.error('Failed to fetch donations for reminders:', error);
      return NextResponse.json(
        { error: 'Failed to fetch donations' },
        { status: 500 }
      );
    }

    if (!donations || donations.length === 0) {
      return NextResponse.json({ success: true, remindersSent: 0 });
    }

    let remindersSent = 0;

    for (const donation of donations) {
      // Check if donor hasn't confirmed
      if (!donation.donor_confirmed && donation.donor_id) {
        // In production, this would send a push notification or email
        // For now, we'll just log it
        console.log(`Reminder sent to donor ${donation.donor_id} for donation ${donation.id}`);
        remindersSent++;
      }

      // Check if recipient hasn't confirmed
      if (!donation.recipient_confirmed && donation.from_user_id) {
        // In production, this would send a push notification or email
        // For now, we'll just log it
        console.log(`Reminder sent to recipient ${donation.from_user_id} for donation ${donation.id}`);
        remindersSent++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      remindersSent,
      donationsChecked: donations.length
    });
  } catch (error) {
    console.error('Error in donation reminders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
