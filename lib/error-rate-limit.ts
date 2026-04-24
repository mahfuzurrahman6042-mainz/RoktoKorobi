// Error rate limiting to prevent abuse through error-generating requests
const errorCounts = new Map<string, { count: number; resetTime: number }>();
const ERROR_RATE_LIMIT = 20; // 20 errors per minute per IP
const ERROR_WINDOW_MS = 60 * 1000; // 1 minute window

export function checkErrorRateLimit(identifier: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = errorCounts.get(identifier);

  if (!record || now > record.resetTime) {
    // Reset or create new record
    errorCounts.set(identifier, {
      count: 1,
      resetTime: now + ERROR_WINDOW_MS,
    });
    return { allowed: true, remaining: ERROR_RATE_LIMIT - 1 };
  }

  if (record.count >= ERROR_RATE_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: ERROR_RATE_LIMIT - record.count };
}

export function recordError(identifier: string): void {
  checkErrorRateLimit(identifier);
}

// Cleanup old records periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of errorCounts.entries()) {
    if (now > record.resetTime) {
      errorCounts.delete(key);
    }
  }
}, ERROR_WINDOW_MS);
