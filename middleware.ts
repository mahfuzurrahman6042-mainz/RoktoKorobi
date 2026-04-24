import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { parseSessionCookie, verifySessionToken } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const cookieHeader = request.headers.get('cookie');
  const sessionToken = parseSessionCookie(cookieHeader);
  
  // If no session token, redirect to login
  if (!sessionToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Verify the token
  const user = await verifySessionToken(sessionToken);
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Check if user has access to dashboard routes
  const path = request.nextUrl.pathname;
  
  if (path.startsWith('/dashboard/super-admin') && user.role !== 'super_admin') {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  if (path.startsWith('/dashboard/admin') && user.role !== 'admin' && user.role !== 'super_admin') {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  if (path.startsWith('/dashboard/org-advocate') && 
      user.role !== 'org_advocate' && 
      user.role !== 'admin' && 
      user.role !== 'super_admin') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
