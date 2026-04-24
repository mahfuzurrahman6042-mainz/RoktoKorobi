import { NextRequest, NextResponse } from 'next/server';
import { createLogoutCookie } from '@/lib/auth';
import { rateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { parseCSRFCookie, validateCSRFToken } from '@/lib/csrf';
import { parseSessionCookie, verifySessionToken } from '@/lib/auth';
import { logSecurityEvent } from '@/lib/audit-log';

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting: 10 logout attempts per minute per IP
    const identifier = getClientIdentifier(request);
    const { success } = await rateLimit(identifier, 10, 60 * 1000);
    
    if (!success) {
      return NextResponse.json({ 
        error: 'Too many logout attempts. Please try again later.' 
      }, { status: 429 });
    }

    // Get user info for logging before clearing session
    const cookieHeader = request.headers.get('cookie');
    const sessionToken = parseSessionCookie(cookieHeader);
    let userId: string | undefined;
    let userEmail: string | undefined;

    if (sessionToken) {
      const user = await verifySessionToken(sessionToken);
      if (user) {
        userId = user.id;
        userEmail = user.email;
      }
    }

    // Validate CSRF token
    const csrfCookieToken = parseCSRFCookie(cookieHeader);
    const csrfHeaderToken = request.headers.get('x-csrf-token');
    
    if (!validateCSRFToken(csrfCookieToken, csrfHeaderToken)) {
      return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
    }

    const cookie = createLogoutCookie();

    // Log logout event
    if (userId) {
      await logSecurityEvent(
        'LOGOUT',
        'authentication',
        undefined,
        userId,
        userEmail,
        request.headers.get('x-forwarded-for') || 'unknown',
        true
      );
    }

    return NextResponse.json(
      { success: true },
      {
        status: 200,
        headers: {
          'Set-Cookie': cookie,
        },
      }
    );
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
