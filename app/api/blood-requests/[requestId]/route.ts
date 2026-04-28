import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifySessionToken } from '@/lib/auth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const { requestId } = await params;

    if (!requestId) {
      return NextResponse.json(
        { error: 'Request ID required' },
        { status: 400 }
      );
    }

    // Fetch blood request details
    const { data: request, error } = await supabase
      .from('blood_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (error || !request) {
      return NextResponse.json(
        { error: 'Blood request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(request);
  } catch (error) {
    console.error('Error fetching blood request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const { requestId } = await params;
    const body = await request.json();
    const { donorId } = body;

    // Verify session
    const sessionToken = request.cookies.get('session_token')?.value;
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = await verifySessionToken(sessionToken);
    if (!user || user.id !== donorId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Fetch current request
    const { data: bloodRequest, error: fetchError } = await supabase
      .from('blood_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (fetchError || !bloodRequest) {
      return NextResponse.json(
        { error: 'Blood request not found' },
        { status: 404 }
      );
    }

    // Check if request is still pending
    if (bloodRequest.status !== 'pending') {
      return NextResponse.json(
        { error: 'Request is no longer available' },
        { status: 400 }
      );
    }

    // Check blood group compatibility
    const { data: donorProfile } = await supabase
      .from('profiles')
      .select('blood_group, is_available')
      .eq('id', donorId)
      .single();

    if (!donorProfile) {
      return NextResponse.json(
        { error: 'Donor profile not found' },
        { status: 404 }
      );
    }

    if (donorProfile.blood_group !== bloodRequest.blood_group) {
      return NextResponse.json(
        { error: 'Blood group mismatch' },
        { status: 400 }
      );
    }

    if (!donorProfile.is_available) {
      return NextResponse.json(
        { error: 'Donor is not available' },
        { status: 400 }
      );
    }

    // Accept the request
    const { error: updateError } = await supabase
      .from('blood_requests')
      .update({
        donor_id: donorId,
        status: 'accepted',
        accepted_at: new Date().toISOString()
      })
      .eq('id', requestId);

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to accept request' },
        { status: 500 }
      );
    }

    // Mark donor as unavailable
    await supabase
      .from('profiles')
      .update({ is_available: false })
      .eq('id', donorId);

    return NextResponse.json({ 
      success: true, 
      message: 'Request accepted successfully',
      trackingUrl: `/track/${requestId}`
    });
  } catch (error) {
    console.error('Error accepting blood request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
