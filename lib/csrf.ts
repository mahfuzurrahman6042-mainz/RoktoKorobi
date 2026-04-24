import { serialize, parse } from 'cookie';
import { randomBytes } from 'crypto';

const CSRF_COOKIE_NAME = 'roktokorobi-csrf';
const CSRF_TOKEN_LENGTH = 32;

export function generateCSRFToken(): string {
  return randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
}

export function createCSRFCookie(token: string): string {
  return serialize(CSRF_COOKIE_NAME, token, {
    httpOnly: false, // Must be readable by JavaScript
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  });
}

export function parseCSRFCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const cookies = parse(cookieHeader);
  return cookies[CSRF_COOKIE_NAME] || null;
}

export function validateCSRFToken(
  cookieToken: string | null,
  headerToken: string | null
): boolean {
  if (!cookieToken || !headerToken) return false;
  return cookieToken === headerToken;
}

export function getCSRFTokenFromRequest(request: Request): string | null {
  // Check header first (for API requests)
  const headerToken = request.headers.get('x-csrf-token');
  if (headerToken) return headerToken;
  
  // Check body for form submissions
  return null; // Will be handled by parsing body in API routes
}
