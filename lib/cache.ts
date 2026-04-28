// Caching utilities for performance optimization

export const CACHE_DURATION = {
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 15 * 60 * 1000, // 15 minutes
  LONG: 60 * 60 * 1000, // 1 hour
};

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  duration: number;
}

class Cache<T> {
  private cache: Map<string, CacheEntry<T>> = new Map();

  set(key: string, data: T, duration: number = CACHE_DURATION.MEDIUM): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      duration
    });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.duration) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }

  clearPattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }
}

// Singleton cache instances
export const donorCache = new Cache<any>();
export const bloodRequestCache = new Cache<any>();
export const leaderboardCache = new Cache<any>();

// Cache keys
export const CACHE_KEYS = {
  DONORS_LIST: 'donors:list',
  DONORS_BY_BLOOD_GROUP: (group: string) => `donors:blood:${group}`,
  DONORS_BY_LOCATION: (location: string) => `donors:location:${location}`,
  BLOOD_REQUESTS_LIST: 'blood_requests:list',
  BLOOD_REQUESTS_PENDING: 'blood_requests:pending',
  BLOOD_REQUESTS_BY_DISTRICT: (district: string) => `blood_requests:district:${district}`,
  LEADERBOARD: 'leaderboard',
  LEADERBOARD_BY_DISTRICT: (district: string) => `leaderboard:district:${district}`,
};

// Invalidate cache helpers
export function invalidateDonorCache(): void {
  donorCache.clearPattern('donors:');
}

export function invalidateBloodRequestCache(): void {
  bloodRequestCache.clearPattern('blood_requests:');
}

export function invalidateLeaderboardCache(): void {
  leaderboardCache.clearPattern('leaderboard:');
}

export function invalidateAllCaches(): void {
  donorCache.clear();
  bloodRequestCache.clear();
  leaderboardCache.clear();
}
