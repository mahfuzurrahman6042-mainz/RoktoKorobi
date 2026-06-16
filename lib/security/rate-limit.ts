// Simple in-memory rate limiter for development
// In production, use Redis or a dedicated rate limiting service

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  skipSuccessfulRequests?: boolean; // Only count failed requests
  skipFailedRequests?: boolean; // Only count successful requests
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

// Clean up expired entries
function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Get rate limit entry
function getRateLimitEntry(identifier: string, windowMs: number): RateLimitEntry {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);
  
  if (!entry || now > entry.resetTime) {
    const newEntry: RateLimitEntry = {
      count: 0,
      resetTime: now + windowMs,
    };
    rateLimitStore.set(identifier, newEntry);
    return newEntry;
  }
  
  return entry;
}

// Rate limit middleware
export function rateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  // Clean up expired entries periodically
  if (rateLimitStore.size > 1000) {
    cleanupExpiredEntries();
  }
  
  const entry = getRateLimitEntry(identifier, config.windowMs);
  const now = Date.now();
  
  // Check if window has expired
  if (now > entry.resetTime) {
    entry.count = 0;
    entry.resetTime = now + config.windowMs;
  }
  
  // Check if limit exceeded
  if (entry.count >= config.maxRequests) {
    return {
      success: false,
      limit: config.maxRequests,
      remaining: 0,
      reset: entry.resetTime,
    };
  }
  
  // Increment count
  entry.count++;
  
  return {
    success: true,
    limit: config.maxRequests,
    remaining: config.maxRequests - entry.count,
    reset: entry.resetTime,
  };
}

// IP-based rate limiter
export function rateLimitByIP(
  ip: string,
  config: RateLimitConfig
): RateLimitResult {
  return rateLimit(`ip:${ip}`, config);
}

// User-based rate limiter
export function rateLimitByUser(
  userId: string,
  config: RateLimitConfig
): RateLimitResult {
  return rateLimit(`user:${userId}`, config);
}

// Endpoint-based rate limiter
export function rateLimitByEndpoint(
  endpoint: string,
  config: RateLimitConfig
): RateLimitResult {
  return rateLimit(`endpoint:${endpoint}`, config);
}

// Combined rate limiter (IP + Endpoint)
export function rateLimitByIPAndEndpoint(
  ip: string,
  endpoint: string,
  config: RateLimitConfig
): RateLimitResult {
  return rateLimit(`ip:${ip}:endpoint:${endpoint}`, config);
}

// Predefined rate limit configurations
export const RateLimitPresets = {
  // Strict rate limiting for authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 requests per 15 minutes
  },
  
  // Moderate rate limiting for API endpoints
  api: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute
  },
  
  // Lenient rate limiting for public endpoints
  public: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30, // 30 requests per minute
  },
  
  // Strict rate limiting for sensitive operations
  sensitive: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10, // 10 requests per hour
  },
};

// Express middleware wrapper (if needed for API routes)
export function createRateLimitMiddleware(config: RateLimitConfig) {
  return (request: Request): { allowed: boolean; headers: Record<string, string> } => {
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    const result = rateLimitByIP(ip, config);
    
    return {
      allowed: result.success,
      headers: {
        'X-RateLimit-Limit': result.limit.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': new Date(result.reset).toISOString(),
        ...(result.success ? {} : { 'Retry-After': Math.ceil((result.reset - Date.now()) / 1000).toString() }),
      },
    };
  };
}
