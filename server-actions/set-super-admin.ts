'use server';

import { setSuperAdmin } from '@/lib/firebase';

/**
 * Set a user as Super Admin
 * This should only be called by trusted sources
 */
export async function setUserAsSuperAdmin(email: string) {
  try {
    const result = await setSuperAdmin(email);
    return { success: true, message: `User ${email} has been set as Super Admin`, result };
  } catch (error) {
    console.error('Error setting super admin:', error);
    return { success: false, message: `Failed to set ${email} as Super Admin`, error: String(error) };
  }
}
