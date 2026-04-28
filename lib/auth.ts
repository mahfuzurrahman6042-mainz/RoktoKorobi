import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { serialize, parse } from 'cookie';

const SALT_ROUNDS = 10;
const SESSION_IDLE_TIMEOUT = 30 * 60 * 1000; // 30 minutes of inactivity
const COOKIE_NAME = 'roktokorobi-session';

// Lazy load JWT_SECRET to avoid client-side errors
function getJWT_SECRET(): Uint8Array {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable must be set');
  }
  return new TextEncoder().encode(process.env.JWT_SECRET);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: string;
  is_donor: boolean;
  can_upload_illustrations?: boolean;
  last_activity?: number; // Timestamp of last activity
}

export async function createSessionToken(user: UserSession): Promise<string> {
  const token = await new SignJWT({ 
    ...user,
    last_activity: Date.now(), // Set initial activity timestamp
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(getJWT_SECRET());
  
  return token;
}

export async function verifySessionToken(token: string): Promise<UserSession | null> {
  try {
    const { payload } = await jwtVerify(token, getJWT_SECRET());
    const session = payload as unknown as UserSession;
    
    // Check if session has been idle for too long
    if (session.last_activity) {
      const idleTime = Date.now() - session.last_activity;
      if (idleTime > SESSION_IDLE_TIMEOUT) {
        return null; // Session expired due to inactivity
      }
    }
    
    return session;
  } catch {
    return null;
  }
}

export function createSessionCookie(token: string): string {
  return serialize(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  });
}

export function createLogoutCookie(): string {
  return serialize(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  });
}

export function parseSessionCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const cookies = parse(cookieHeader);
  return cookies[COOKIE_NAME] || null;
}

export async function refreshSessionActivity(user: UserSession): Promise<string> {
  const token = await new SignJWT({ 
    ...user,
    last_activity: Date.now(), // Update activity timestamp
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(getJWT_SECRET());
  
  return token;
}
