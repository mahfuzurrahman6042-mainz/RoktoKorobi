import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { parseSessionCookie, verifySessionToken } from '@/lib/auth';
import { rateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { parseCSRFCookie, validateCSRFToken } from '@/lib/csrf';
import { logSecurityEvent } from '@/lib/audit-log';

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting: 3 disable attempts per hour per IP
    const identifier = getClientIdentifier(request);
    const { success } = await rateLimit(identifier, 3, 60 * 60 * 1000);
    
    if (!success) {
      return NextResponse.json({ 
        error: 'Too many disable attempts. Please try again later.' 
      }, { status: 429 });
    }

    // Validate CSRF token
    const cookieHeader = request.headers.get('cookie');
    const csrfCookieToken = parseCSRFCookie(cookieHeader);
    const csrfHeaderToken = request.headers.get('x-csrf-token');
    
    if (!validateCSRFToken(csrfCookieToken, csrfHeaderToken)) {
      return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
    }

    const sessionToken = parseSessionCookie(cookieHeader);
    
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await verifySessionToken(sessionToken);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Disable 2FA
    const { error } = await supabase
      .from('profiles')
      .update({
        totp_secret: null,
        backup_codes: [],
        is_2fa_enabled: false,
      })
      .eq('id', user.id)
      .select('id, email, name, is_2fa_enabled')
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to disable 2FA' }, { status: 500 });
    }

    // Log 2FA disablement
    await logSecurityEvent(
      '2FA_DISABLED',
      'authentication',
      undefined,
      user.id,
      user.email,
      request.headers.get('x-forwarded-for') || 'unknown',
      true
    );

    return NextResponse.json({
      success: true,
      message: '2FA disabled successfully',
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
