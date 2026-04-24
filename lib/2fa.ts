import crypto from 'crypto';

// Note: 2FA temporarily disabled for production build due to otplib API issues
// To re-enable: install compatible otplib version or use alternative library

export function generate2FASecret(): string {
  // Generate a random secret as placeholder
  return crypto.randomBytes(32).toString('hex');
}

export function verify2FACode(code: string, secret: string): boolean {
  // Placeholder: always return false (2FA disabled)
  console.warn('2FA verification disabled - implement with compatible library');
  return false;
}

export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
  }
  return codes;
}

export function hashBackupCode(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex');
}
