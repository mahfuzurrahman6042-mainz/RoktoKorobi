import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { parseCSRFCookie, validateCSRFToken } from '@/lib/csrf';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Validate CSRF token
    const cookieHeader = request.headers.get('cookie');
    const cookieToken = parseCSRFCookie(cookieHeader);
    const headerToken = request.headers.get('x-csrf-token') || (await request.json()).csrfToken;
    
    if (!validateCSRFToken(cookieToken, headerToken)) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      );
    }

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

    // Check if dispute is raised
    if (donation.dispute_raised) {
      return NextResponse.json(
        { error: 'Cannot confirm donation. A dispute has been raised.' },
        { status: 400 }
      );
    }

    // Check if this is the first confirmation
    const isFirstConfirmation = !donation.donor_confirmed && !donation.recipient_confirmed;
    const now = new Date().toISOString();

    // Update confirmation based on role
    const updateData: any = role === 'donor' 
      ? { donor_confirmed: true }
      : { recipient_confirmed: true };

    // Set first_confirmed_at and auto_complete_at if this is the first confirmation
    if (isFirstConfirmation) {
      updateData.first_confirmed_at = now;
      // Auto-complete after 6 hours
      const autoCompleteTime = new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString();
      updateData.auto_complete_at = autoCompleteTime;
    }

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

    // Check if both have confirmed (immediate completion)
    const donorConfirmed = role === 'donor' ? true : donation.donor_confirmed;
    const recipientConfirmed = role === 'recipient' ? true : donation.recipient_confirmed;

    if (donorConfirmed && recipientConfirmed) {
      // Mark as completed immediately
      const { error: completeError } = await supabase
        .from('blood_requests')
        .update({
          status: 'completed',
          completed_at: now,
          auto_complete_at: null // Clear auto-complete timer
        })
        .eq('id', donationId);

      if (completeError) {
        console.error('Failed to mark donation as completed:', completeError);
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
