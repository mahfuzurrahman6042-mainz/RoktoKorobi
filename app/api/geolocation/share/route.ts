import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifySessionToken } from '@/lib/auth';
import { parseCSRFCookie, validateCSRFToken } from '@/lib/csrf';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get('cookie');
    const sessionToken = cookieHeader ? parseSessionCookie(cookieHeader) : null;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = await verifySessionToken(sessionToken);
    if (!userId) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Validate CSRF token
    const cookieToken = parseCSRFCookie(cookieHeader);
    const headerToken = request.headers.get('x-csrf-token') || (await request.json()).csrfToken;
    
    if (!validateCSRFToken(cookieToken, headerToken)) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { requestId, latitude, longitude } = body;

    if (!requestId || latitude === undefined || longitude === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate coordinates
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 });
    }

    // Update the blood request with donor's location
    const { error } = await supabase
      .from('blood_requests')
      .update({
        donor_latitude: latitude,
        donor_longitude: longitude,
        donor_location_shared_at: new Date().toISOString()
      })
      .eq('id', requestId)
      .eq('donor_id', userId);

    if (error) {
      return NextResponse.json({ error: 'Failed to update location' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function parseSessionCookie(cookieHeader: string): string | null {
  const cookies = cookieHeader.split(';').map(c => c.trim());
  const sessionCookie = cookies.find(c => c.startsWith('session='));
  return sessionCookie ? sessionCookie.split('=')[1] : null;
}
