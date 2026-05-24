// @ts-nocheck - Supabase type inference issues with Database types
'use server';

import { createAdminClient } from '@/lib/supabase/admin';

export async function assignSuperAdminRole(userId: string) {
  const supabase = await createAdminClient();

  try {
    // Check if user already has a role
    const { data: existingRole } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (existingRole) {
      return { success: false, error: 'User already has a role assigned' };
    }

    // Get super admin role ID
    const { data: superAdminRole, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'super_admin')
      .single();

    if (roleError || !superAdminRole) {
      return { success: false, error: 'Super admin role not found' };
    }

    // Assign super admin role
    const { error: assignError } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role_id: superAdminRole.id,
        is_active: true
      });

    if (assignError) {
      return { success: false, error: assignError.message };
    }

    return { success: true, message: 'Super admin role assigned successfully' };
  } catch (error) {
    return { success: false, error: 'Failed to assign super admin role' };
  }
}

export async function isFirstUser(): Promise<boolean> {
  const supabase = await createAdminClient();

  const { count } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true });

  return (count || 0) === 0;
}
