// Device fingerprinting for enhanced security
// Generates a unique fingerprint based on device characteristics

export interface DeviceFingerprint {
  userAgent: string;
  platform: string;
  language: string;
  screenResolution: string;
  timezone: string;
  hardwareConcurrency?: number;
  deviceMemory?: number;
}

export function generateDeviceFingerprint(request: Request): string {
  const userAgent = request.headers.get('user-agent') || '';
  const acceptLanguage = request.headers.get('accept-language') || '';
  const acceptEncoding = request.headers.get('accept-encoding') || '';
  
  // Create a simple fingerprint from available headers
  // In a real implementation, you might also use client-side fingerprinting libraries
  const fingerprint = [
    userAgent,
    acceptLanguage,
    acceptEncoding,
  ].join('|');

  // Simple hash (in production, use a proper hash function)
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return Math.abs(hash).toString(36);
}

// Store device fingerprints for users to detect unusual devices
const userDeviceMap = new Map<string, Set<string>>();

export function recordDeviceForUser(userId: string, deviceFingerprint: string): void {
  if (!userDeviceMap.has(userId)) {
    userDeviceMap.set(userId, new Set());
  }
  userDeviceMap.get(userId)!.add(deviceFingerprint);
}

export function isKnownDevice(userId: string, deviceFingerprint: string): boolean {
  const devices = userDeviceMap.get(userId);
  return devices ? devices.has(deviceFingerprint) : false;
}

export function getUserDevices(userId: string): string[] {
  const devices = userDeviceMap.get(userId);
  return devices ? Array.from(devices) : [];
}

export function checkUnusualDevice(userId: string, deviceFingerprint: string): boolean {
  // If user has no devices yet, this is not unusual
  const devices = userDeviceMap.get(userId);
  if (!devices || devices.size === 0) {
    return false;
  }

  // If device is known, it's not unusual
  if (devices.has(deviceFingerprint)) {
    return false;
  }

  // If device is unknown, it's unusual
  return true;
}
