import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Middleware disabled temporarily to allow app to work
  // TODO: Implement proper session-based authentication
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
