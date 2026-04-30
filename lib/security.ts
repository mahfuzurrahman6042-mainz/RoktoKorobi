import crypto from 'crypto';
import { NextRequest } from 'next/server';

// CSRF Token Management
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function validateCSRFToken(token: string): boolean {
  // Basic validation - in production, you'd verify against session
  return token && token.length === 64 && /^[a-f0-9]+$/.test(token);
}

// Rate Limiting (in-memory for development)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function validateRateLimit(
  identifier: string, 
  endpoint: string, 
  maxRequests: number, 
  windowMs: number
): boolean {
  const key = `${identifier}:${endpoint}`;
  const now = Date.now();
  const windowStart = now - windowMs;

  const existing = rateLimitStore.get(key);
  
  if (!existing || existing.resetTime < windowStart) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (existing.count >= maxRequests) {
    return false;
  }

  existing.count++;
  return true;
}

// JWT Token Management
export function generateJWT(payload: any): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }

  const header = { alg: 'HS256', typ: 'JWT' };
  const jwtPayload = {
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
  };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(jwtPayload)).toString('base64url');
  
  const signatureInput = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(signatureInput)
    .digest('base64url');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export function validateJWT(token: string): any {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }

  try {
    const [header, payload, signature] = token.split('.');
    
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${header}.${payload}`)
      .digest('base64url');

    if (signature !== expectedSignature) {
      return null;
    }

    const decodedPayload = JSON.parse(Buffer.from(payload, 'base64url').toString());
    
    // Check expiration
    if (decodedPayload.exp && decodedPayload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return decodedPayload;
  } catch {
    return null;
  }
}

export function validateSessionToken(token: string): any {
  return validateJWT(token);
}

// Input Sanitization
export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove on* event handlers
    .replace(/data:/gi, '') // Remove data: protocol
    .replace(/vbscript:/gi, '') // Remove vbscript: protocol
    .replace(/&#/g, '') // Remove HTML entities
    .trim();
}

// Input Validation
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[\d\s\-\(\)+]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

export function validateAge(age: number): boolean {
  return age >= 13 && age <= 100;
}

export function validateWeight(weight: number): boolean {
  return weight >= 30 && weight <= 200;
}

// Password Hashing
export async function hashPassword(password: string): Promise<string> {
  const bcrypt = require('bcryptjs');
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  const bcrypt = require('bcryptjs');
  return bcrypt.compare(password, hash);
}

// IP Access Control (Basic implementation)
export function checkIPAccess(ip: string): { allowed: boolean; reason?: string } {
  // Basic implementation - in production, you'd check against whitelist/blacklist
  return { allowed: true };
}

// Geolocation Access Control (Basic implementation)
export async function checkGeolocationAccess(ip: string): Promise<{ allowed: boolean; reason?: string }> {
  // Basic implementation - in production, you'd check against country restrictions
  return Promise.resolve({ allowed: true });
}

// Device Fingerprinting (Basic implementation)
export function generateDeviceFingerprint(request: NextRequest): string {
  const userAgent = request.headers.get('user-agent') || '';
  const acceptLanguage = request.headers.get('accept-language') || '';
  const acceptEncoding = request.headers.get('accept-encoding') || '';
  
  // Create a simple fingerprint from available headers
  const fingerprint = Buffer.from(`${userAgent}-${acceptLanguage}-${acceptEncoding}`).toString('base64');
  return fingerprint;
}

// Rate Limiting Identifier
export function getClientIdentifier(request: NextRequest): string {
  const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
  const userAgent = request.headers.get('user-agent') || '';
  
  // Create a simple identifier
  return `${ip}-${userAgent}`;
}
