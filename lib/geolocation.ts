// Geolocation-based access control
// Configure blocked countries via environment variable

const BLOCKED_COUNTRIES = process.env.BLOCKED_COUNTRIES?.split(',').map(c => c.trim().toUpperCase()) || [];
const ALLOWED_COUNTRIES = process.env.ALLOWED_COUNTRIES?.split(',').map(c => c.trim().toUpperCase()) || [];

// Simple IP to country mapping (in production, use a proper geolocation service)
// This is a basic implementation - for production use a service like ipstack, ipinfo.io, or MaxMind
const countryCodeCache = new Map<string, string>();

async function getCountryCodeFromIP(ip: string): Promise<string> {
  // Check cache first
  if (countryCodeCache.has(ip)) {
    return countryCodeCache.get(ip)!;
  }

  // If no API key is configured, allow all (for development)
  if (!process.env.IPSTACK_API_KEY) {
    console.warn('IPSTACK_API_KEY not configured. Geolocation is disabled. Allowing all countries.');
    const countryCode = 'UNKNOWN';
    countryCodeCache.set(ip, countryCode);
    return countryCode;
  }

  try {
    // Use ipstack API for geolocation
    const response = await fetch(`http://api.ipstack.com/${ip}?access_key=${process.env.IPSTACK_API_KEY}`);
    const data = await response.json();
    
    if (data.error) {
      console.error('Geolocation API error:', data.error);
      // On API error, allow all (fail-open for availability)
      const countryCode = 'UNKNOWN';
      countryCodeCache.set(ip, countryCode);
      return countryCode;
    }
    
    const countryCode = data.country_code || 'UNKNOWN';
    countryCodeCache.set(ip, countryCode);
    return countryCode;
  } catch (error) {
    console.error('Error fetching geolocation:', error);
    // On network error, allow all (fail-open for availability)
    const countryCode = 'UNKNOWN';
    countryCodeCache.set(ip, countryCode);
    return countryCode;
  }
}

export async function checkGeolocationAccess(ip: string): Promise<{ allowed: boolean; country?: string; reason?: string }> {
  const countryCode = await getCountryCodeFromIP(ip);

  // If no restrictions configured, allow all
  if (BLOCKED_COUNTRIES.length === 0 && ALLOWED_COUNTRIES.length === 0) {
    return { allowed: true, country: countryCode };
  }

  // Check if country is blocked
  if (BLOCKED_COUNTRIES.includes(countryCode)) {
    return { allowed: false, country: countryCode, reason: 'Country is blocked' };
  }

  // Check if country is allowed (if whitelist is configured)
  if (ALLOWED_COUNTRIES.length > 0 && !ALLOWED_COUNTRIES.includes(countryCode)) {
    return { allowed: false, country: countryCode, reason: 'Country is not allowed' };
  }

  return { allowed: true, country: countryCode };
}

export function addBlockedCountry(countryCode: string): void {
  const upper = countryCode.toUpperCase();
  if (!BLOCKED_COUNTRIES.includes(upper)) {
    BLOCKED_COUNTRIES.push(upper);
  }
}

export function addAllowedCountry(countryCode: string): void {
  const upper = countryCode.toUpperCase();
  if (!ALLOWED_COUNTRIES.includes(upper)) {
    ALLOWED_COUNTRIES.push(upper);
  }
}
