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
    // Apply rate limiting: 30 favorites per minute per user
    const identifier = getClientIdentifier(request);
    const { success } = await rateLimit(identifier, 30, 60 * 1000);
    
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

    // Check if already favorited
    const { data: existing } = await supabase
      .from('user_favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('illustration_id', id)
      .single();

    if (existing) {
      // Remove from favorites
      const { error: deleteError } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('illustration_id', id);

      if (deleteError) {
        return NextResponse.json({ error: 'Failed to remove from favorites' }, { status: 500 });
      }

      return NextResponse.json({ success: true, favorited: false }, { status: 200 });
    } else {
      // Add to favorites
      const { error: insertError } = await supabase
        .from('user_favorites')
        .insert({
          user_id: user.id,
          illustration_id: id,
        });

      if (insertError) {
        return NextResponse.json({ error: 'Failed to add to favorites' }, { status: 500 });
      }

      return NextResponse.json({ success: true, favorited: true }, { status: 200 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
