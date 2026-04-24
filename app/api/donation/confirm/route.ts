import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { donationId, role } = body;

    // Validate required fields
    if (!donationId || !role) {
      return NextResponse.json(
        { error: 'Missing required fields: donationId, role' },
        { status: 400 }
      );
    }

    // Validate role
    if (role !== 'donor' && role !== 'recipient') {
      return NextResponse.json(
        { error: 'Invalid role. Must be "donor" or "recipient"' },
        { status: 400 }
      );
    }

    // Fetch current donation
    const { data: donation, error: fetchError } = await supabase
      .from('blood_requests')
      .select('*')
      .eq('id', donationId)
      .single();

    if (fetchError || !donation) {
      return NextResponse.json(
        { error: 'Donation not found' },
        { status: 404 }
      );
    }

    // Update confirmation based on role
    const updateData = role === 'donor' 
      ? { donor_confirmed: true }
      : { recipient_confirmed: true };

    const { error: updateError } = await supabase
      .from('blood_requests')
      .update(updateData)
      .eq('id', donationId);

    if (updateError) {
      console.error('Failed to update confirmation:', updateError);
      return NextResponse.json(
        { error: 'Failed to update confirmation' },
        { status: 500 }
      );
    }

    // Check if both have confirmed
    if (donation.donor_confirmed || role === 'donor') {
      const donorConfirmed = role === 'donor' ? true : donation.donor_confirmed;
      const recipientConfirmed = role === 'recipient' ? true : donation.recipient_confirmed;

      if (donorConfirmed && recipientConfirmed) {
        // Mark as completed
        const { error: completeError } = await supabase
          .from('blood_requests')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('id', donationId);

        if (completeError) {
          console.error('Failed to mark donation as completed:', completeError);
        }

        // Clear donor's live location
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
              last_donated_at: new Date().toISOString(),
              is_available: false,
              current_lat: null,
              current_lon: null,
              is_gps_active: false
            })
            .eq('id', donation.donor_id);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in donation confirmation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
