import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { parseSessionCookie, verifySessionToken } from '@/lib/auth';
import { generate2FASecret, generateBackupCodes, hashBackupCode } from '@/lib/2fa';
import { rateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { parseCSRFCookie, validateCSRFToken } from '@/lib/csrf';
import { logSecurityEvent } from '@/lib/audit-log';

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting: 3 setup attempts per hour per IP
    const identifier = getClientIdentifier(request);
    const { success } = await rateLimit(identifier, 3, 60 * 60 * 1000);
    
    if (!success) {
      return NextResponse.json({ 
        error: 'Too many 2FA setup attempts. Please try again later.' 
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

    // Generate TOTP secret
    const totpSecret = generate2FASecret();
    
    // Generate backup codes and hash them
    const backupCodes = generateBackupCodes(10);
    const hashedBackupCodes = backupCodes.map(hashBackupCode);
    
    // Store in database (hash backup codes)
    const { error } = await supabase
      .from('profiles')
      .update({
        totp_secret: totpSecret,
        backup_codes: hashedBackupCodes,
        is_2fa_enabled: true,
      })
      .eq('id', user.id)
      .select('id, email, name, is_2fa_enabled')
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to enable 2FA' }, { status: 500 });
    }

    // Log 2FA enablement
    await logSecurityEvent(
      '2FA_ENABLED',
      'authentication',
      undefined,
      user.id,
      user.email,
      request.headers.get('x-forwarded-for') || 'unknown',
      true
    );

    return NextResponse.json({
      success: true,
      message: '2FA enabled successfully',
      backupCodes, // Only show once - save these securely
      // TOTP secret is NOT returned for security - user must scan QR code in production
      totpSecret: process.env.NODE_ENV === 'development' ? totpSecret : undefined,
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
