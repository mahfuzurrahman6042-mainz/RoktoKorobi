import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { parseSessionCookie, verifySessionToken } from '@/lib/auth';
import { verify2FACode, hashBackupCode } from '@/lib/2fa';
import { rateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { parseCSRFCookie, validateCSRFToken } from '@/lib/csrf';
import { logSecurityEvent } from '@/lib/audit-log';

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting: 10 verification attempts per minute per IP
    const identifier = getClientIdentifier(request);
    const { success } = await rateLimit(identifier, 10, 60 * 1000);
    
    if (!success) {
      return NextResponse.json({ 
        error: 'Too many verification attempts. Please try again later.' 
      }, { status: 429 });
    }

    // Validate CSRF token
    const cookieHeader = request.headers.get('cookie');
    const csrfCookieToken = parseCSRFCookie(cookieHeader);
    const csrfHeaderToken = request.headers.get('x-csrf-token');
    
    if (!validateCSRFToken(csrfCookieToken, csrfHeaderToken)) {
      return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
    }

    const body = await request.json();
    const { code, useBackup = false } = body;

    if (!code) {
      return NextResponse.json({ error: 'Verification code is required' }, { status: 400 });
    }

    const sessionToken = parseSessionCookie(cookieHeader);
    
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await verifySessionToken(sessionToken);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user's 2FA settings
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('totp_secret, backup_codes, is_2fa_enabled')
      .eq('id', user.id)
      .single();

    if (error || !profile) {
      return NextResponse.json({ error: 'Failed to fetch 2FA settings' }, { status: 500 });
    }

    if (!profile.is_2fa_enabled) {
      return NextResponse.json({ error: '2FA is not enabled for this account' }, { status: 400 });
    }

    let isValid = false;

    if (useBackup) {
      // Verify backup code (hash the input and compare)
      const hashedInput = hashBackupCode(code);
      if (profile.backup_codes && profile.backup_codes.includes(hashedInput)) {
        isValid = true;
        // Remove used backup code
        await supabase
          .from('profiles')
          .update({
            backup_codes: profile.backup_codes.filter((c: string) => c !== hashedInput),
          })
          .eq('id', user.id);
      }
    } else {
      // Verify TOTP code with time window
      isValid = verify2FACode(code, profile.totp_secret || '');
    }

    if (isValid) {
      // Log successful 2FA verification
      await logSecurityEvent(
        '2FA_VERIFIED',
        'authentication',
        undefined,
        user.id,
        user.email,
        request.headers.get('x-forwarded-for') || 'unknown',
        true,
        useBackup ? 'Used backup code' : 'Used TOTP code'
      );

      return NextResponse.json({ success: true }, { status: 200 });
    } else {
      // Log failed 2FA attempt
      await logSecurityEvent(
        '2FA_FAILED',
        'authentication',
        undefined,
        user.id,
        user.email,
        request.headers.get('x-forwarded-for') || 'unknown',
        false,
        'Invalid 2FA code'
      );

      return NextResponse.json({ error: 'Invalid verification code' }, { status: 401 });
    }

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
