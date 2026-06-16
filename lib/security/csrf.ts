import { cookies } from 'next/headers';
import { randomBytes, createHash } from 'crypto';

// CSRF Token Management
const CSRF_SECRET = process.env.CSRF_SECRET || 'default-secret-change-in-production';
const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';

// Generate CSRF token
export function generateCSRFToken(): string {
  const timestamp = Date.now();
  const random = randomBytes(32).toString('hex');
  const data = `${timestamp}:${random}`;
  const signature = createHash('sha256')
    .update(`${data}:${CSRF_SECRET}`)
    .digest('hex');
  
  return `${data}:${signature}`;
}

// Validate CSRF token
export function validateCSRFToken(token: string): boolean {
  try {
    const [data, signature] = token.split(':');
    const expectedSignature = createHash('sha256')
      .update(`${data}:${CSRF_SECRET}`)
      .digest('hex');
    
    // Check signature
    if (signature !== expectedSignature) {
      return false;
    }
    
    // Check token age (max 1 hour)
    const [timestamp] = data.split(':');
    const age = Date.now() - parseInt(timestamp);
    if (age > 3600000) { // 1 hour in milliseconds
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('CSRF validation error:', error);
    return false;
  }
}

// Set CSRF cookie
export async function setCSRFCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 3600, // 1 hour
    path: '/',
  });
}

// Get CSRF token from cookie
export async function getCSRFCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(CSRF_COOKIE_NAME)?.value || null;
}

// Get CSRF token from header
export function getCSRFHeader(request: Request): string | null {
  return request.headers.get(CSRF_HEADER_NAME);
}

// Validate CSRF request
export async function validateCSRFRequest(request: Request): Promise<boolean> {
  const headerToken = getCSRFHeader(request);
  const cookieToken = await getCSRFCookie();
  
  if (!headerToken || !cookieToken) {
    return false;
  }
  
  if (headerToken !== cookieToken) {
    return false;
  }
  
  return validateCSRFToken(cookieToken);
}

// Middleware wrapper for CSRF protection
export function withCSRFProtection(handler: (request: Request) => Promise<Response>) {
  return async (request: Request): Promise<Response> => {
    // Skip validation for GET, HEAD, OPTIONS
    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
      return handler(request);
    }
    
    // Validate CSRF for state-changing methods
    const isValid = await validateCSRFRequest(request);
    
    if (!isValid) {
      return new Response('Invalid CSRF token', { status: 403 });
    }
    
    return handler(request);
  };
}
