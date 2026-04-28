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
    const { donorId, donationId } = body;

    if (!donorId) {
      return NextResponse.json(
        { error: 'Donor ID required' },
        { status: 400 }
      );
    }

    // Mark donor as arrived in blood_requests table
    if (donationId) {
      const { error } = await supabase
        .from('blood_requests')
        .update({
          status: 'arrived',
          geofence_triggered_at: new Date().toISOString()
        })
        .eq('id', donationId);

      if (error) {
        console.error('Failed to mark donor as arrived:', error);
        return NextResponse.json(
          { error: 'Failed to mark arrival' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in donor arrival:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
