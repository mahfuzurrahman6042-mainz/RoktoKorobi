import { NextRequest, NextResponse } from 'next/server';
import { parseSessionCookie, verifySessionToken, refreshSessionActivity, createSessionCookie } from '@/lib/auth';
import { rateLimit, getClientIdentifier } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting: 60 session checks per minute per IP
    const identifier = getClientIdentifier(request);
    const { success } = await rateLimit(identifier, 60, 60 * 1000);
    
    if (!success) {
      return NextResponse.json({ 
        error: 'Too many requests. Please try again later.' 
      }, { status: 429 });
    }

    const cookieHeader = request.headers.get('cookie');
    const sessionToken = parseSessionCookie(cookieHeader);

    if (!sessionToken) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const user = await verifySessionToken(sessionToken);

    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // Refresh session activity
    const newToken = await refreshSessionActivity(user);
    const newCookie = createSessionCookie(newToken);

    const response = NextResponse.json({ user }, { status: 200 });
    response.headers.set('Set-Cookie', newCookie);

    return response;
  } catch (error) {
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
