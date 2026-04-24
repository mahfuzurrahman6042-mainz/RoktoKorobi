import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { parseSessionCookie, verifySessionToken } from '@/lib/auth';
import { rateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { parseCSRFCookie, validateCSRFToken } from '@/lib/csrf';

// Prevent static generation
export const dynamic = 'force-dynamic';

function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Apply rate limiting: 20 rejections per minute per user
    const identifier = getClientIdentifier(request);
    const { success } = await rateLimit(identifier, 20, 60 * 1000);
    
    if (!success) {
      return NextResponse.json({ 
        error: 'Too many requests. Please try again later.' 
      }, { status: 429 });
    }

    // Check request size (max 1KB for simple actions)
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 1024) {
      return NextResponse.json({ error: 'Request too large' }, { status: 413 });
    }

    // Validate CSRF token
    const cookieHeader = request.headers.get('cookie');
    const csrfCookieToken = parseCSRFCookie(cookieHeader);
    const csrfHeaderToken = request.headers.get('x-csrf-token');
    
    if (!validateCSRFToken(csrfCookieToken, csrfHeaderToken)) {
      return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
    }

    const { id } = await params;
    
    // Validate UUID
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: 'Invalid illustration ID' }, { status: 400 });
    }

    const sessionToken = parseSessionCookie(cookieHeader);
    
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await verifySessionToken(sessionToken);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const { data, error } = await supabase
      .from('illustrations')
      .update({ status: 'rejected' })
      .eq('id', id)
      .select('id, title, description, image_url, section_id, language, status, created_at')
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to reject illustration' }, { status: 500 });
    }

    return NextResponse.json({ success: true, illustration: data }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
