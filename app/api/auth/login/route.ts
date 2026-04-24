import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyPassword, createSessionToken, createSessionCookie } from '@/lib/auth';
import { sanitizeInput, validateEmail } from '@/lib/validation';
import { rateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { generateCSRFToken, createCSRFCookie } from '@/lib/csrf';
import { logSecurityEvent } from '@/lib/audit-log';
import { setAPIVersion } from '@/lib/api-version';
import { checkErrorRateLimit } from '@/lib/error-rate-limit';
import { checkIPAccess } from '@/lib/ip-filter';
import { checkGeolocationAccess } from '@/lib/geolocation';
import { generateDeviceFingerprint, checkUnusualDevice, recordDeviceForUser } from '@/lib/device-fingerprint';
import { trackUserActivity, detectAnomalies } from '@/lib/anomaly-detection';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    // Check IP access (whitelist/blacklist)
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
    const ipAccess = checkIPAccess(ipAddress);
    
    if (!ipAccess.allowed) {
      return NextResponse.json({ 
        error: ipAccess.reason || 'Access denied' 
      }, { status: 403 });
    }

    // Check geolocation access
    const geoAccess = await checkGeolocationAccess(ipAddress);
    
    if (!geoAccess.allowed) {
      return NextResponse.json({ 
        error: geoAccess.reason || 'Access denied from your location' 
      }, { status: 403 });
    }

    // Generate device fingerprint
    const deviceFingerprint = generateDeviceFingerprint(request);

    // Apply rate limiting: 5 login attempts per 15 minutes per IP
    const identifier = getClientIdentifier(request);
    const { success, remaining } = await rateLimit(identifier, 5, 15 * 60 * 1000);
    
    if (!success) {
      return NextResponse.json({ 
        error: 'Too many login attempts. Please try again later.' 
      }, { status: 429 });
    }

    // Check request size (max 1MB)
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 1024 * 1024) {
      return NextResponse.json({ error: 'Request too large' }, { status: 413 });
    }

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const sanitizedEmail = sanitizeInput(email.toLowerCase().trim());
    
    if (!validateEmail(sanitizedEmail)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Check if account is locked
    const { data: lockoutData } = await supabase.rpc('check_account_lockout', { p_email: sanitizedEmail });
    if (lockoutData) {
      const { data: remaining } = await supabase.rpc('get_lockout_remaining', { p_email: sanitizedEmail });
      const minutes = Math.ceil((remaining || 0) / 60);
      return NextResponse.json({ error: `Account locked. Try again in ${minutes} minutes.` }, { status: 403 });
    }

    // Fetch user from database
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, name, password, role, is_donor, can_upload_illustrations, is_2fa_enabled, email_verified')
      .eq('email', sanitizedEmail)
      .single();

    if (error || !data) {
      await supabase.rpc('record_login_attempt', { 
        p_email: sanitizedEmail, 
        p_ip_address: request.headers.get('x-forwarded-for') || 'unknown', 
        p_success: false 
      });
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Check if email is verified
    if (!data.email_verified) {
      return NextResponse.json({ 
        error: 'Please verify your email before logging in. Check your inbox for the verification link.' 
      }, { status: 403 });
    }

    // Check concurrent sessions (max 3 concurrent sessions per user)
    const { data: sessionCheck } = await supabase.rpc('check_concurrent_sessions', {
      p_user_id: data.id,
      p_max_sessions: 3
    });

    if (!sessionCheck) {
      return NextResponse.json({ 
        error: 'Maximum concurrent sessions reached. Please log out from another device.' 
      }, { status: 429 });
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, data.password);
    if (!isPasswordValid) {
      // Track failed activity for anomaly detection
      trackUserActivity(data.id, false);

      // Log failed login attempt
      await logSecurityEvent(
        'LOGIN_FAILED',
        'authentication',
        undefined,
        data.id,
        sanitizedEmail,
        request.headers.get('x-forwarded-for') || 'unknown',
        false,
        'Invalid password'
      );

      await supabase.rpc('record_login_attempt', { 
        p_email: sanitizedEmail, 
        p_ip_address: request.headers.get('x-forwarded-for') || 'unknown', 
        p_success: false 
      });
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Check if 2FA is enabled
    if (data.is_2fa_enabled) {
      return NextResponse.json({
        requires2FA: true,
        message: 'Please provide 2FA verification code',
        userId: data.id,
      }, { status: 200 });
    }

    // Record successful login
    await supabase.rpc('record_login_attempt', { 
      p_email: sanitizedEmail, 
      p_ip_address: request.headers.get('x-forwarded-for') || 'unknown', 
      p_success: true 
    });

    // Log successful login
    await logSecurityEvent(
      'LOGIN_SUCCESS',
      'authentication',
      undefined,
      data.id,
      sanitizedEmail,
      request.headers.get('x-forwarded-for') || 'unknown',
      true
    );

    // Record device fingerprint
    recordDeviceForUser(data.id, deviceFingerprint);

    // Track activity for anomaly detection
    trackUserActivity(data.id, true);

    // Check for anomalies
    const anomalies = detectAnomalies(data.id);
    if (anomalies.hasAnomaly) {
      // Log anomaly but don't block login
      await logSecurityEvent(
        'ANOMALY_DETECTED',
        'authentication',
        undefined,
        data.id,
        sanitizedEmail,
        ipAddress,
        true,
        `Anomalies: ${anomalies.reasons.join(', ')}`
      );
    }

    // Create session token
    const sessionToken = await createSessionToken({
      id: data.id,
      email: data.email,
      name: data.name,
      role: data.role,
      is_donor: data.is_donor,
      can_upload_illustrations: data.can_upload_illustrations,
    });

    // Calculate session expiration (24 hours from now)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    // Create session in database
    try {
      const tokenHash = crypto.createHash('sha256').update(sessionToken).digest('hex');
      await supabase.rpc('create_user_session', {
        p_user_id: data.id,
        p_token_hash: tokenHash,
        p_ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        p_user_agent: request.headers.get('user-agent') || 'unknown',
        p_expires_at: expiresAt,
      });
    } catch (sessionError) {
      // Fail silently - don't break login if session tracking fails
    }

    // Create httpOnly cookie
    const cookie = createSessionCookie(sessionToken);

    // Generate and set CSRF token
    const csrfToken = generateCSRFToken();
    const csrfCookie = createCSRFCookie(csrfToken);

    const response = NextResponse.json(
      { 
        success: true,
        user: {
          id: data.id,
          email: data.email,
          name: data.name,
          role: data.role,
          is_donor: data.is_donor,
        },
        csrfToken,
      }, 
      { status: 200 }
    );

    setAPIVersion(response);

    response.headers.set('Set-Cookie', cookie);
    response.headers.append('Set-Cookie', csrfCookie);

    return response;
  } catch (error) {
    // Check error rate limit
    const identifier = getClientIdentifier(request);
    const { allowed } = checkErrorRateLimit(identifier);
    
    if (!allowed) {
      return NextResponse.json({ 
        error: 'Too many errors. Please try again later.' 
      }, { status: 429 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
