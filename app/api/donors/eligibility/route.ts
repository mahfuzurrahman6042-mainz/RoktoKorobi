import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifySessionToken } from '@/lib/auth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const DONATION_GAP_DAYS = 90; // Minimum days between donations

export async function GET(request: NextRequest) {
  try {
    // Verify session
    const sessionToken = request.cookies.get('session_token')?.value;
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = await verifySessionToken(sessionToken);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Fetch donor profile with last donation date
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('last_donation_date, is_donor, total_donations')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    if (!profile.is_donor) {
      return NextResponse.json({
        eligible: false,
        reason: 'User is not registered as a donor',
        lastDonationDate: null,
        nextEligibleDate: null,
        daysUntilEligible: null
      });
    }

    // Calculate eligibility
    const lastDonation = profile.last_donation_date ? new Date(profile.last_donation_date) : null;
    const today = new Date();
    
    if (!lastDonation) {
      // First-time donor
      return NextResponse.json({
        eligible: true,
        reason: 'First-time donor',
        lastDonationDate: null,
        nextEligibleDate: null,
        daysUntilEligible: 0,
        totalDonations: profile.total_donations || 0
      });
    }

    const daysSinceLastDonation = Math.floor(
      (today.getTime() - lastDonation.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    const nextEligibleDate = new Date(lastDonation);
    nextEligibleDate.setDate(nextEligibleDate.getDate() + DONATION_GAP_DAYS);
    
    const daysUntilEligible = Math.max(0, DONATION_GAP_DAYS - daysSinceLastDonation);
    const eligible = daysSinceLastDonation >= DONATION_GAP_DAYS;

    return NextResponse.json({
      eligible,
      reason: eligible 
        ? 'Eligible to donate' 
        : `Must wait ${daysUntilEligible} more days before next donation`,
      lastDonationDate: profile.last_donation_date,
      nextEligibleDate: nextEligibleDate.toISOString(),
      daysUntilEligible,
      daysSinceLastDonation,
      totalDonations: profile.total_donations || 0,
      minimumGapDays: DONATION_GAP_DAYS
    });
  } catch (error) {
    console.error('Error checking donation eligibility:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
