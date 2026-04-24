import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  try {
    // Fetch real-time stats from database
    
    // Count registered donors (users with is_donor = true)
    const { count: donorCount, error: donorError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_donor', true);

    // Count fulfilled blood requests
    const { count: requestCount, error: requestError } = await supabase
      .from('blood_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'fulfilled');

    // Count partner organizations (organizations table)
    const { count: partnerCount, error: partnerError } = await supabase
      .from('organizations')
      .select('*', { count: 'exact', head: true });

    // Return stats with fallback to 0 if tables don't exist
    return NextResponse.json({
      registered_donors: donorCount || 0,
      blood_requests_fulfilled: requestCount || 0,
      partner_organizations: partnerCount || 0
    });
  } catch (error) {
    // Return default values on any error
    return NextResponse.json({
      registered_donors: 0,
      blood_requests_fulfilled: 0,
      partner_organizations: 0
    });
  }
}
