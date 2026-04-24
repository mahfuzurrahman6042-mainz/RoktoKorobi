import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createSessionToken, createSessionCookie } from '@/lib/auth';
import { verify2FACode, hashBackupCode } from '@/lib/2fa';
import { rateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { generateCSRFToken, createCSRFCookie } from '@/lib/csrf';
import { logSecurityEvent } from '@/lib/audit-log';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting: 10 2FA attempts per minute per IP
    const identifier = getClientIdentifier(request);
    const { success } = await rateLimit(identifier, 10, 60 * 1000);
    
    if (!success) {
      return NextResponse.json({ 
        error: 'Too many 2FA attempts. Please try again later.' 
      }, { status: 429 });
    }

    const body = await request.json();
    const { userId, code, useBackup = false } = body;

    if (!userId || !code) {
      return NextResponse.json({ error: 'User ID and code are required' }, { status: 400 });
    }

    // Fetch user's 2FA settings
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, email, name, role, is_donor, can_upload_illustrations, totp_secret, backup_codes, is_2fa_enabled, email_verified')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!profile.is_2fa_enabled) {
      return NextResponse.json({ error: '2FA is not enabled for this account' }, { status: 400 });
    }

    if (!profile.email_verified) {
      return NextResponse.json({ 
        error: 'Please verify your email before logging in' 
      }, { status: 403 });
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
          .eq('id', userId);
      }
    } else {
      // Verify TOTP code with time window
      isValid = verify2FACode(code, profile.totp_secret || '');
    }

    if (!isValid) {
      // Log failed 2FA attempt
      await logSecurityEvent(
        'LOGIN_2FA_FAILED',
        'authentication',
        undefined,
        profile.id,
        profile.email,
        request.headers.get('x-forwarded-for') || 'unknown',
        false,
        'Invalid 2FA code during login'
      );

      return NextResponse.json({ error: 'Invalid verification code' }, { status: 401 });
    }

    // 2FA verified - create session
    const sessionToken = await createSessionToken({
      id: profile.id,
      email: profile.email,
      name: profile.name,
      role: profile.role,
      is_donor: profile.is_donor,
      can_upload_illustrations: profile.can_upload_illustrations,
    });

    // Calculate session expiration (24 hours from now)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    // Hash full session token for database storage
    const tokenHash = crypto.createHash('sha256').update(sessionToken).digest('hex');

    // Create session in database
    try {
      await supabase.rpc('create_user_session', {
        p_user_id: profile.id,
        p_token_hash: tokenHash,
        p_ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        p_user_agent: request.headers.get('user-agent') || 'unknown',
        p_expires_at: expiresAt,
      });
    } catch (sessionError) {
      // Fail silently
    }

    // Create httpOnly cookie
    const cookie = createSessionCookie(sessionToken);

    // Generate and set CSRF token
    const csrfToken = generateCSRFToken();
    const csrfCookie = createCSRFCookie(csrfToken);

    // Record successful login
    await supabase.rpc('record_login_attempt', { 
      p_email: profile.email, 
      p_ip_address: request.headers.get('x-forwarded-for') || 'unknown', 
      p_success: true 
    });

    // Log successful login with 2FA
    await logSecurityEvent(
      'LOGIN_SUCCESS_2FA',
      'authentication',
      undefined,
      profile.id,
      profile.email,
      request.headers.get('x-forwarded-for') || 'unknown',
      true,
      useBackup ? 'Used backup code' : 'Used TOTP code'
    );

    const response = NextResponse.json(
      { 
        success: true,
        user: {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          role: profile.role,
          is_donor: profile.is_donor,
        },
        csrfToken,
      }, 
      { status: 200 }
    );

    response.headers.set('Set-Cookie', cookie);
    response.headers.append('Set-Cookie', csrfCookie);

    return response;

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
