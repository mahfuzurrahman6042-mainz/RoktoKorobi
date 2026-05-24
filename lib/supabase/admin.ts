// @ts-nocheck - Supabase RPC type inference issues with Database types
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase/types';

/**
 * Admin-specific Supabase server client
 * Use this for server-side operations in admin routes
 */
export async function createAdminClient() {
  const cookieStore = await cookies();
  
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value }) => cookieStore.set(name, value));
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored.
          }
        },
      },
    }
  );
}

/**
 * Get the current authenticated user with their roles
 */
export async function getCurrentAdminUser() {
  const supabase = await createAdminClient();
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return null;
  }

  // Fetch user roles
  const { data: userRoles } = await supabase
    .from('user_roles')
    .select(`
      role_id,
      is_active,
      expires_at,
      roles (
        id,
        name,
        description
      )
    `)
    .eq('user_id', user.id)
    .eq('is_active', true);

  // Fetch user profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  return {
    user,
    roles: userRoles?.map((ur: any) => ({
      ...ur.roles,
      is_active: ur.is_active,
      expires_at: ur.expires_at
    })) || [],
    profile
  };
}

/**
 * Check if user has specific role
 */
export async function userHasRole(userId: string, roleName: string): Promise<boolean> {
  const supabase = await createAdminClient();
  
  const { data, error } = await supabase
    .from('user_roles')
    .select(`
      roles (
        name
      )
    `)
    .eq('user_id', userId)
    .eq('is_active', true)
    .single();

  if (error || !data) return false;

  const userRole = (data as any).roles as any;
  return userRole?.name === roleName;
}

/**
 * Check if user has specific permission
 */
export async function userHasPermission(userId: string, permissionName: string): Promise<boolean> {
  const supabase = await createAdminClient();
  
  // @ts-ignore - Supabase RPC type inference issue
  const { data, error } = await supabase
    .rpc('user_has_permission', {
      p_user_id: userId,
      p_permission_name: permissionName
    });

  if (error) {
    console.error('Permission check error:', error);
    return false;
  }

  return data || false;
}

/**
 * Get all permissions for a user
 */
export async function getUserPermissions(userId: string): Promise<string[]> {
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

  const permissions: string[] = [];
  
  (data as any).forEach((userRole: any) => {
    userRole.role_permissions?.forEach((rp: any) => {
      if (rp.granted && rp.permissions) {
        permissions.push(rp.permissions.name);
      }
    });
  });

  return [...new Set(permissions)]; // Remove duplicates
}
