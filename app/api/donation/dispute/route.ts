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
    const body = await request.json();
    const headerToken = request.headers.get('x-csrf-token') || body.csrfToken;
    
    if (!validateCSRFToken(cookieToken, headerToken)) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      );
    }

    const { donationId, reason } = body;

    // Validate required fields
    if (!donationId) {
      return NextResponse.json(
        { error: 'Missing required field: donationId' },
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

    // Check if donation is already completed
    if (donation.status === 'completed') {
      return NextResponse.json(
        { error: 'Cannot dispute a completed donation' },
        { status: 400 }
      );
    }

    // Check if dispute is already raised
    if (donation.dispute_raised) {
      return NextResponse.json(
        { error: 'Dispute already raised for this donation' },
        { status: 400 }
      );
    }

    // Check if within 6-hour window
    if (donation.first_confirmed_at) {
      const firstConfirmed = new Date(donation.first_confirmed_at);
      const now = new Date();
      const hoursSinceConfirm = (now.getTime() - firstConfirmed.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceConfirm > 6) {
        return NextResponse.json(
          { error: 'Dispute window has expired (6 hours after first confirmation)' },
          { status: 400 }
        );
      }
    }

    // Raise dispute
    const { error: updateError } = await supabase
      .from('blood_requests')
      .update({
        dispute_raised: true,
        dispute_reason: reason || 'No reason provided',
        auto_complete_at: null // Cancel auto-complete
      })
      .eq('id', donationId);

    if (updateError) {
      console.error('Failed to raise dispute:', updateError);
      return NextResponse.json(
        { error: 'Failed to raise dispute' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Dispute raised successfully' });
  } catch (error) {
    console.error('Error in dispute:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
