// @ts-nocheck - Supabase RPC type inference issues with Database types
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Permission definitions
 * Centralized list of all system permissions
 */
export const PERMISSIONS = {
  // User Management
  MANAGE_USERS: 'manage_users',
  SUSPEND_USERS: 'suspend_users',
  DELETE_USERS: 'delete_users',
  ASSIGN_ROLES: 'assign_roles',
  REVOKE_ROLES: 'revoke_roles',

  // Testimonial Management
  APPROVE_TESTIMONIALS: 'approve_testimonials',
  DELETE_TESTIMONIALS: 'delete_testimonials',
  FEATURE_TESTIMONIALS: 'feature_testimonials',

  // Blog Management
  CREATE_BLOG: 'create_blog',
  EDIT_BLOG: 'edit_blog',
  DELETE_BLOG: 'delete_blog',
  PUBLISH_BLOG: 'publish_blog',

  // Illustration Management
  PUBLISH_ILLUSTRATIONS: 'publish_illustrations',
  EDIT_ILLUSTRATIONS: 'edit_illustrations',
  DELETE_ILLUSTRATIONS: 'delete_illustrations',

  // Hospital & Organization Management
  MANAGE_HOSPITALS: 'manage_hospitals',
  MANAGE_ORGANIZATIONS: 'manage_organizations',
  MANAGE_CAMPAIGNS: 'manage_campaigns',

  // System Management
  ACCESS_ADMIN_DASHBOARD: 'access_admin_dashboard',
  VIEW_ACTIVITY_LOGS: 'view_activity_logs',
  MANAGE_SETTINGS: 'manage_settings',
  CREATE_SUPER_ADMIN: 'create_super_admin',

  // Verification
  VERIFY_BLOOD_REQUESTS: 'verify_blood_requests',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

/**
 * Check if a user has a specific permission
 */
export async function hasPermission(userId: string, permission: Permission): Promise<boolean> {
  const supabase = await createAdminClient();
  
  // @ts-expect-error - Supabase RPC type inference issue
  const { data, error } = await supabase
    .rpc('user_has_permission', {
      p_user_id: userId,
      p_permission_name: permission
    });

  if (error) {
    console.error('Permission check error:', error);
    return false;
  }

  return data || false;
}

/**
 * Check if a user has any of the specified permissions
 */
export async function hasAnyPermission(userId: string, permissions: Permission[]): Promise<boolean> {
  const results = await Promise.all(
    permissions.map(perm => hasPermission(userId, perm))
  );
  
  return results.some(result => result);
}

/**
 * Check if a user has all of the specified permissions
 */
export async function hasAllPermissions(userId: string, permissions: Permission[]): Promise<boolean> {
  const results = await Promise.all(
    permissions.map(perm => hasPermission(userId, perm))
  );
  
  return results.every(result => result);
}

/**
 * Get all permissions for a user
 */
export async function getUserPermissions(userId: string): Promise<Permission[]> {
  const supabase = await createAdminClient();
  
  const { data, error } = await supabase
    .from('user_roles')
    .select(`
      role_permissions (
        granted,
        permissions (
          name
        )
      )
    `)
    .eq('user_id', userId)
    .eq('is_active', true);

  if (error || !data) return [];

  const permissions: Permission[] = [];
  
  (data as any).forEach((userRole: any) => {
    userRole.role_permissions?.forEach((rp: any) => {
      if (rp.granted && rp.permissions) {
        permissions.push(rp.permissions.name as Permission);
      }
    });
  });

  return [...new Set(permissions)]; // Remove duplicates
}

/**
 * Check if user is Super Admin (bypasses permission checks)
 */
export async function isSuperAdmin(userId: string): Promise<boolean> {
  const supabase = await createAdminClient();
  
  // @ts-expect-error - Supabase RPC type inference issue
  const { data, error } = await supabase
    .rpc('user_has_role', {
      p_user_id: userId,
      p_role_name: 'super_admin'
    });

  if (error) {
    console.error('Role check error:', error);
    return false;
  }

  return data || false;
}

/**
 * Get user's role names
 */
export async function getUserRoles(userId: string): Promise<string[]> {
  const supabase = await createAdminClient();
  
  const { data, error } = await supabase
    .from('user_roles')
    .select(`
      roles (
        name
      )
    `)
    .eq('user_id', userId)
    .eq('is_active', true);

  if (error || !data) return [];

  return (data as any).map((ur: any) => (ur.roles as any).name);
}

/**
 * Check if user has specific role
 */
export async function hasRole(userId: string, roleName: string): Promise<boolean> {
  const supabase = await createAdminClient();
  
  // @ts-expect-error - Supabase RPC type inference issue
  const { data, error } = await supabase
    .rpc('user_has_role', {
      p_user_id: userId,
      p_role_name: roleName
    });

  if (error) {
    console.error('Role check error:', error);
    return false;
  }

  return data || false;
}
