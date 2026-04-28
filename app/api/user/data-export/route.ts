import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifySessionToken } from '@/lib/auth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
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

    // Fetch user's data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: 'Failed to fetch profile data' },
        { status: 500 }
      );
    }

    // Fetch user's blood requests
    const { data: bloodRequests, error: requestsError } = await supabase
      .from('blood_requests')
      .select('*')
      .eq('contact', profile.phone);

    // Fetch user's donation history (as donor)
    const { data: donations, error: donationsError } = await supabase
      .from('blood_requests')
      .select('*')
      .eq('donor_id', user.id);

    // Compile user data
    const userData = {
      profile: {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        blood_group: profile.blood_group,
        location: profile.location,
        age: profile.age,
        weight: profile.weight,
        is_donor: profile.is_donor,
        total_donations: profile.total_donations,
        last_donation_date: profile.last_donation_date,
        created_at: profile.created_at,
        updated_at: profile.updated_at
      },
      bloodRequests: bloodRequests || [],
      donations: donations || [],
      exportDate: new Date().toISOString()
    };

    // Convert to JSON string
    const jsonData = JSON.stringify(userData, null, 2);

    // Update profile with export request timestamp
    await supabase
      .from('profiles')
      .update({ data_export_requested_at: new Date().toISOString() })
      .eq('id', user.id);

    // Return the data for download
    return NextResponse.json({
      success: true,
      data: userData,
      filename: `roktokorobi-data-${user.id}-${Date.now()}.json`
    });
  } catch (error) {
    console.error('Error exporting user data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
