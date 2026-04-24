import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifySessionToken } from '@/lib/auth';

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

    const body = await request.json();
    const { consent } = body;

    if (typeof consent !== 'boolean') {
      return NextResponse.json({ error: 'Invalid consent value' }, { status: 400 });
    }

    // Update user's location sharing consent
    const { error } = await supabase
      .from('profiles')
      .update({ location_sharing_consent: consent })
      .eq('id', userId);

    if (error) {
      return NextResponse.json({ error: 'Failed to update consent' }, { status: 500 });
    }

    return NextResponse.json({ success: true, consent });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
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

    // Get user's current location sharing consent status
    const { data, error } = await supabase
      .from('profiles')
      .select('location_sharing_consent')
      .eq('id', userId)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch consent status' }, { status: 500 });
    }

    return NextResponse.json({ consent: data?.location_sharing_consent || false });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function parseSessionCookie(cookieHeader: string): string | null {
  const cookies = cookieHeader.split(';').map(c => c.trim());
  const sessionCookie = cookies.find(c => c.startsWith('session='));
  return sessionCookie ? sessionCookie.split('=')[1] : null;
}
