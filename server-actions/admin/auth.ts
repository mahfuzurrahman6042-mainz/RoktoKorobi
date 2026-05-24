// @ts-nocheck - Supabase type inference issues with Database types
'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

/**
 * Check if Super Admin registration is allowed
 */
export async function isSuperAdminRegistrationAllowed(): Promise<boolean> {
  const supabase = await createAdminClient();
  
  const { data } = await supabase
    .from('system_settings')
    .select('value')
    .eq('key', 'allow_super_admin_creation')
    .single();

  return (data as any)?.value === 'true';
}

/**
 * Check if any Super Admin exists
 */
export async function hasSuperAdmin(): Promise<boolean> {
  const supabase = await createAdminClient();
  
  const { count, error } = await supabase
    .from('user_roles')
    .select('*', { count: 'exact', head: true })
    // @ts-ignore - Supabase type inference issue
    .eq('role_id', (await supabase.from('roles').select('id').eq('name', 'super_admin').single()).data?.id as string)
    .eq('is_active', true);

  if (error) return false;
  return (count || 0) > 0;
}

/**
 * Toggle Super Admin registration
 * Only existing Super Admins can toggle this
 */
export async function toggleSuperAdminRegistration(allowed: boolean, adminId: string) {
  const supabase = await createAdminClient();
  
  // Verify the requester is a Super Admin
  const { data: userRoles } = await supabase
    .from('user_roles')
    .select('roles!inner(name)')
    .eq('user_id', adminId)
    .eq('is_active', true);

  const isSuperAdmin = userRoles?.some((ur: any) => ur.roles.name === 'super_admin');
  
  if (!isSuperAdmin) {
    throw new Error('Only Super Admins can toggle Super Admin registration');
  }

  // Update the setting
  // @ts-ignore - Supabase type inference issue
  const { error } = await supabase
    .from('system_settings')
    .update({ 
      value: allowed ? 'true' : 'false',
      updated_by: adminId,
      updated_at: new Date().toISOString()
    } as any)
    .eq('key', 'allow_super_admin_creation');

  if (error) {
    throw new Error(`Failed to toggle Super Admin registration: ${error.message}`);
  }

  // Log the activity
  await supabase
    .from('activity_logs')
    .insert({
      user_id: adminId,
      action: 'toggle_super_admin_registration',
      resource_type: 'system_settings',
      details: { allowed }
    } as any);

  revalidatePath('/admin/settings');
  
  return { success: true, allowed };
}

/**
 * Create the first Super Admin
 * This can only be called when no Super Admin exists
 */
export async function createFirstSuperAdmin(email: string, password: string, fullName: string) {
  const supabase = await createAdminClient();
  
  // Check if any Super Admin already exists
  const hasAdmin = await hasSuperAdmin();
  if (hasAdmin) {
    throw new Error('Super Admin already exists. Registration is disabled.');
  }

  // Check if registration is allowed
  const isAllowed = await isSuperAdminRegistrationAllowed();
  if (!isAllowed) {
    throw new Error('Super Admin registration is currently disabled');
  }

  // Create the user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });

  if (authError) {
    throw new Error(`Failed to create user: ${authError.message}`);
  }

  if (!authData.user) {
    throw new Error('Failed to create user');
  }

  // Get the Super Admin role
  const { data: roleData } = await supabase
    .from('roles')
    .select('id')
    .eq('name', 'super_admin')
    .single();

  if (!roleData) {
    throw new Error('Super Admin role not found');
  }

  // Assign the Super Admin role
  // @ts-ignore - Supabase type inference issue
  const { error: roleError } = await supabase
    .from('user_roles')
    .insert({
      user_id: authData.user.id,
      role_id: roleData.id as string,
      is_active: true
    } as any);

  if (roleError) {
    throw new Error(`Failed to assign role: ${roleError.message}`);
  }

  // Create user profile
  const { error: profileError } = await supabase
    .from('user_profiles')
    .insert({
      user_id: authData.user.id,
      full_name: fullName,
      is_verified: true
    } as any);

  if (profileError) {
    throw new Error(`Failed to create profile: ${profileError.message}`);
  }

  // Disable Super Admin registration after first admin is created
  // @ts-ignore - Supabase type inference issue
  await supabase
    .from('system_settings')
    .update({ 
      value: 'false',
      updated_by: authData.user.id,
      updated_at: new Date().toISOString()
    } as any)
    .eq('key', 'allow_super_admin_creation');

  // Log the activity
  await supabase
    .from('activity_logs')
    .insert({
      user_id: authData.user.id,
      action: 'create_first_super_admin',
      resource_type: 'user',
      resource_id: authData.user.id,
      details: { email, full_name: fullName }
    } as any);

  revalidatePath('/admin');
  
  return { success: true, userId: authData.user.id };
}

/**
 * Promote an existing user to Super Admin
 * Only existing Super Admins can do this
 */
export async function promoteToSuperAdmin(targetUserId: string, adminId: string) {
  const supabase = await createAdminClient();
  
  // Verify the requester is a Super Admin
  const { data: requesterRoles } = await supabase
    .from('user_roles')
    .select('roles!inner(name)')
    .eq('user_id', adminId)
    .eq('is_active', true);

  const isSuperAdmin = requesterRoles?.some((ur: any) => ur.roles.name === 'super_admin');
  
  if (!isSuperAdmin) {
    throw new Error('Only Super Admins can promote users to Super Admin');
  }

  // Check if Super Admin creation is allowed
  const isAllowed = await isSuperAdminRegistrationAllowed();
  if (!isAllowed) {
    throw new Error('Super Admin creation is currently disabled');
  }

  // Check max Super Admins limit
  // @ts-ignore - Supabase type inference issue
  const { count } = await supabase
    .from('user_roles')
    .select('*', { count: 'exact', head: true })
    .eq('role_id', (await supabase.from('roles').select('id').eq('name', 'super_admin').single()).data?.id as string)
    .eq('is_active', true);

  const { data: maxSetting } = await supabase
    .from('system_settings')
    .select('value')
    .eq('key', 'max_super_admins')
    .single();

  const maxAdmins = parseInt((maxSetting as any)?.value || '5');
  if ((count || 0) >= maxAdmins) {
    throw new Error(`Maximum number of Super Admins (${maxAdmins}) reached`);
  }

  // Get the Super Admin role
  const { data: roleData } = await supabase
    .from('roles')
    .select('id')
    .eq('name', 'super_admin')
    .single();

  if (!roleData) {
    throw new Error('Super Admin role not found');
  }

  // Check if user already has Super Admin role
  // @ts-ignore - Supabase type inference issue
  const { data: existingRole } = await supabase
    .from('user_roles')
    .select('*')
    .eq('user_id', targetUserId)
    .eq('role_id', roleData.id as string)
    .single();

  if (existingRole) {
    if ((existingRole as any).is_active) {
      throw new Error('User already has Super Admin role');
    } else {
      // Reactivate the role
      // @ts-ignore - Supabase type inference issue
      const { error } = await supabase
        .from('user_roles')
        .update({ 
          is_active: true,
          assigned_by: adminId,
          assigned_at: new Date().toISOString()
        } as any)
        .eq('id', (existingRole as any).id);

      if (error) {
        throw new Error(`Failed to reactivate role: ${error.message}`);
      }
    }
  } else {
    // Assign the role
    // @ts-ignore - Supabase type inference issue
    const { error } = await supabase
      .from('user_roles')
      .insert({
        user_id: targetUserId,
        role_id: roleData.id,
        assigned_by: adminId,
        is_active: true
      } as any);

    if (error) {
      throw new Error(`Failed to assign role: ${error.message}`);
    }
  }

  // Log the activity
  await supabase
    .from('activity_logs')
    .insert({
      user_id: adminId,
      action: 'promote_to_super_admin',
      resource_type: 'user',
      resource_id: targetUserId,
      details: { promoted_by: adminId }
    } as any);

  revalidatePath('/admin/users');
  
  return { success: true };
}

/**
 * Demote a Super Admin
 * Only Super Admins can do this
 */
export async function demoteFromSuperAdmin(targetUserId: string, adminId: string) {
  const supabase = await createAdminClient();
  
  // Verify the requester is a Super Admin
  const { data: requesterRoles } = await supabase
    .from('user_roles')
    .select('roles!inner(name)')
    .eq('user_id', adminId)
    .eq('is_active', true);

  const isSuperAdmin = requesterRoles?.some((ur: any) => ur.roles.name === 'super_admin');
  
  if (!isSuperAdmin) {
    throw new Error('Only Super Admins can demote Super Admins');
  }

  // Prevent Super Admin from demoting themselves
  if (targetUserId === adminId) {
    throw new Error('Super Admins cannot demote themselves');
  }

  // Get the Super Admin role
  const { data: roleData } = await supabase
    .from('roles')
    .select('id')
    .eq('name', 'super_admin')
    .single();

  if (!roleData) {
    throw new Error('Super Admin role not found');
  }

  // Deactivate the role
  // @ts-ignore - Supabase type inference issue
  const { error } = await supabase
    .from('user_roles')
    .update({ 
      is_active: false,
      assigned_by: adminId
    } as any)
    .eq('user_id', targetUserId)
    .eq('role_id', roleData.id as string);

  if (error) {
    throw new Error(`Failed to demote user: ${error.message}`);
  }

  // Log the activity
  await supabase
    .from('activity_logs')
    .insert({
      user_id: adminId,
      action: 'demote_from_super_admin',
      resource_type: 'user',
      resource_id: targetUserId,
      details: { demoted_by: adminId }
    } as any);

  revalidatePath('/admin/users');
  
  return { success: true };
}

/**
 * Get Super Admin registration status
 */
export async function getSuperAdminRegistrationStatus() {
  const supabase = await createAdminClient();
  
  const [allowedResult, hasAdminResult] = await Promise.all([
    isSuperAdminRegistrationAllowed(),
    hasSuperAdmin()
  ]);

  // Get max Super Admins setting
  const { data: maxSetting } = await supabase
    .from('system_settings')
    .select('value')
    .eq('key', 'max_super_admins')
    .single();

  // Count current Super Admins
  // @ts-ignore - Supabase type inference issue
  const { count } = await supabase
    .from('user_roles')
    .select('*', { count: 'exact', head: true })
    .eq('role_id', (await supabase.from('roles').select('id').eq('name', 'super_admin').single()).data?.id as string)
    .eq('is_active', true);

  return {
    allowed: allowedResult,
    hasFirstAdmin: hasAdminResult,
    maxSuperAdmins: parseInt((maxSetting as any)?.value || '5'),
    currentSuperAdmins: count || 0
  };
}
