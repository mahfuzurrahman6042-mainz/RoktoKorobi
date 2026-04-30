import { supabase } from '@/lib/supabase';

// In-memory cache for IP filters (loaded from database on startup)
let cachedWhitelist: Set<string> = new Set();
let cachedBlacklist: Set<string> = new Set();
let cacheLoaded = false;

// Load initial filters from environment variables
const ENV_WHITELISTED_IPS = process.env.WHITELISTED_IPS?.split(',').map(ip => ip.trim()).filter(ip => ip) || [];
const ENV_BLACKLISTED_IPS = process.env.BLACKLISTED_IPS?.split(',').map(ip => ip.trim()).filter(ip => ip) || [];

// Initialize cache with environment variables
ENV_WHITELISTED_IPS.forEach(ip => cachedWhitelist.add(ip));
ENV_BLACKLISTED_IPS.forEach(ip => cachedBlacklist.add(ip));

// Load filters from database on startup
async function loadFiltersFromDatabase() {
  try {
    const { data, error } = await supabase
      .from('ip_filters')
      .select('ip_address, filter_type')
      .eq('is_active', true);

    if (error) {
      // Table doesn't exist or other error - use env vars only
      // IP filters table not found, using environment variables only
      return;
    }

    if (data) {
      data.forEach(filter => {
        if (filter.filter_type === 'whitelist') {
          cachedWhitelist.add(filter.ip_address);
        } else if (filter.filter_type === 'blacklist') {
          cachedBlacklist.add(filter.ip_address);
        }
      });
      cacheLoaded = true;
    }
  } catch (error) {
    // Error loading IP filters from database
  }
}

// Load filters on module initialization
loadFiltersFromDatabase();

export function isIPWhitelisted(ip: string): boolean {
  if (cachedWhitelist.size === 0) {
    // No whitelist configured, allow all
    return true;
  }
  return cachedWhitelist.has(ip);
}

export function isIPBlacklisted(ip: string): boolean {
  return cachedBlacklist.has(ip);
}

export function checkIPAccess(ip: string): { allowed: boolean; reason?: string } {
  // Check blacklist first
  if (isIPBlacklisted(ip)) {
    return { allowed: false, reason: 'IP is blacklisted' };
  }

  // Then check whitelist
  if (!isIPWhitelisted(ip)) {
    return { allowed: false, reason: 'IP is not whitelisted' };
  }

  return { allowed: true };
}

export async function addToBlacklist(ip: string, createdBy?: string): Promise<boolean> {
  try {
    // Add to database
    const { error } = await supabase
      .from('ip_filters')
      .insert({
        ip_address: ip,
        filter_type: 'blacklist',
        created_by: createdBy
      });

    if (error) {
      // Failed to add IP to blacklist in database
      return false;
    }

    // Update cache
    cachedBlacklist.add(ip);
    return true;
  } catch (error) {
    // Error adding IP to blacklist
    return false;
  }
}

export async function addToWhitelist(ip: string, createdBy?: string): Promise<boolean> {
  try {
    // Add to database
    const { error } = await supabase
      .from('ip_filters')
      .insert({
        ip_address: ip,
        filter_type: 'whitelist',
        created_by: createdBy
      });

    if (error) {
      // Failed to add IP to whitelist in database
      return false;
    }

    // Update cache
    cachedWhitelist.add(ip);
    return true;
  } catch (error) {
    // Error adding IP to whitelist
    return false;
  }
}

export async function removeFromBlacklist(ip: string): Promise<boolean> {
  try {
    // Remove from database (soft delete by setting is_active to false)
    const { error } = await supabase
      .from('ip_filters')
      .update({ is_active: false })
      .eq('ip_address', ip)
      .eq('filter_type', 'blacklist');

    if (error) {
      // Failed to remove IP from blacklist in database
      return false;
    }

    // Update cache
    cachedBlacklist.delete(ip);
    return true;
  } catch (error) {
    // Error removing IP from blacklist
    return false;
  }
}

export async function removeFromWhitelist(ip: string): Promise<boolean> {
  try {
    // Remove from database (soft delete by setting is_active to false)
    const { error } = await supabase
      .from('ip_filters')
      .update({ is_active: false })
      .eq('ip_address', ip)
      .eq('filter_type', 'whitelist');

    if (error) {
      // Failed to remove IP from whitelist in database
      return false;
    }

    // Update cache
    cachedWhitelist.delete(ip);
    return true;
  } catch (error) {
    // Error removing IP from whitelist
    return false;
  }
}

export async function reloadFilters(): Promise<void> {
  cachedWhitelist.clear();
  cachedBlacklist.clear();
  
  // Re-add environment variables
  ENV_WHITELISTED_IPS.forEach(ip => cachedWhitelist.add(ip));
  ENV_BLACKLISTED_IPS.forEach(ip => cachedBlacklist.add(ip));
  
  // Reload from database
  await loadFiltersFromDatabase();
}
