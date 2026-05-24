import { createAdminClient } from '@/lib/supabase/admin';
import { Permission, hasPermission, isSuperAdmin } from './permissions';

/**
 * RBAC Authorization Class
 * Provides methods for checking and enforcing permissions
 */
export class RBACAuthorizer {
  private userId: string;
  private supabase: any;

  constructor(userId: string) {
    this.userId = userId;
  }

  /**
   * Initialize the authorizer with Supabase client
   */
  private async getClient() {
    if (!this.supabase) {
      this.supabase = await createAdminClient();
    }
    return this.supabase;
  }

  /**
   * Check if user can perform an action
   * Super Admins bypass all permission checks
   */
  async can(permission: Permission): Promise<boolean> {
    // Super Admins have all permissions
    const isSA = await isSuperAdmin(this.userId);
    if (isSA) return true;

    return hasPermission(this.userId, permission);
  }

  /**
   * Check if user can perform any of the given permissions
   */
  async canAny(permissions: Permission[]): Promise<boolean> {
    const isSA = await isSuperAdmin(this.userId);
    if (isSA) return true;

    for (const perm of permissions) {
      if (await hasPermission(this.userId, perm)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if user can perform all of the given permissions
   */
  async canAll(permissions: Permission[]): Promise<boolean> {
    const isSA = await isSuperAdmin(this.userId);
    if (isSA) return true;

    for (const perm of permissions) {
      if (!(await hasPermission(this.userId, perm))) {
        return false;
      }
    }
    return true;
  }

  /**
   * Authorize a specific action
   * Throws error if not authorized
   */
  async authorize(permission: Permission, errorMessage?: string): Promise<void> {
    const authorized = await this.can(permission);
    
    if (!authorized) {
      throw new Error(errorMessage || `User does not have permission: ${permission}`);
    }
  }

  /**
   * Get all user permissions
   */
  async getPermissions(): Promise<Permission[]> {
    const supabase = await this.getClient();
    
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
      .eq('user_id', this.userId)
      .eq('is_active', true);

    if (error || !data) return [];

    const permissions: Permission[] = [];
    
    data.forEach(userRole => {
      userRole.role_permissions?.forEach((rp: any) => {
        if (rp.granted && rp.permissions) {
          permissions.push(rp.permissions.name as Permission);
        }
      });
    });

    return [...new Set(permissions)];
  }

  /**
   * Assign a role to a user
   * Only Super Admins can assign roles
   */
  async assignRole(
    targetUserId: string,
    roleId: string,
    assignedBy: string
  ): Promise<void> {
    // Check if the assigner is Super Admin
    const isSA = await isSuperAdmin(assignedBy);
    if (!isSA) {
      throw new Error('Only Super Admins can assign roles');
    }

    const supabase = await this.getClient();

    // Check if Super Admin creation is allowed
    if (roleId === 'super_admin') {
      const { data: setting } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'allow_super_admin_creation')
        .single();

      if (setting?.value !== 'true') {
        throw new Error('Super Admin creation is currently disabled');
      }

      // Check max Super Admins limit
      const { count } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('role_id', roleId)
        .eq('is_active', true);

      const { data: maxSetting } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'max_super_admins')
        .single();

      const maxAdmins = parseInt(maxSetting?.value || '5');
      if ((count || 0) >= maxAdmins) {
        throw new Error(`Maximum number of Super Admins (${maxAdmins}) reached`);
      }
    }

    // Assign the role
    const { error } = await supabase
      .from('user_roles')
      .insert({
        user_id: targetUserId,
        role_id: roleId,
        assigned_by: assignedBy,
        is_active: true
      });

    if (error) {
      throw new Error(`Failed to assign role: ${error.message}`);
    }

    // Log the action
    await this.logActivity('assign_role', 'user_roles', targetUserId, {
      role_id: roleId,
      assigned_by: assignedBy
    });
  }

  /**
   * Revoke a role from a user
   * Only Super Admins can revoke roles
   */
  async revokeRole(
    targetUserId: string,
    roleId: string,
    revokedBy: string
  ): Promise<void> {
    const isSA = await isSuperAdmin(revokedBy);
    if (!isSA) {
      throw new Error('Only Super Admins can revoke roles');
    }

    // Prevent Super Admin from revoking their own role
    if (targetUserId === revokedBy && roleId === 'super_admin') {
      throw new Error('Super Admins cannot revoke their own role');
    }

    const supabase = await this.getClient();

    const { error } = await supabase
      .from('user_roles')
      .update({ is_active: false })
      .eq('user_id', targetUserId)
      .eq('role_id', roleId);

    if (error) {
      throw new Error(`Failed to revoke role: ${error.message}`);
    }

    await this.logActivity('revoke_role', 'user_roles', targetUserId, {
      role_id: roleId,
      revoked_by: revokedBy
    });
  }

  /**
   * Grant a permission to a role
   * Only Super Admins can modify role permissions
   */
  async grantPermission(
    roleId: string,
    permissionId: string,
    grantedBy: string
  ): Promise<void> {
    const isSA = await isSuperAdmin(grantedBy);
    if (!isSA) {
      throw new Error('Only Super Admins can modify role permissions');
    }

    const supabase = await this.getClient();

    const { error } = await supabase
      .from('role_permissions')
      .upsert({
        role_id: roleId,
        permission_id: permissionId,
        granted: true,
        granted_by: grantedBy
      });

    if (error) {
      throw new Error(`Failed to grant permission: ${error.message}`);
    }

    await this.logActivity('grant_permission', 'role_permissions', roleId, {
      permission_id: permissionId,
      granted_by: grantedBy
    });
  }

  /**
   * Revoke a permission from a role
   * Only Super Admins can modify role permissions
   */
  async revokePermission(
    roleId: string,
    permissionId: string,
    revokedBy: string
  ): Promise<void> {
    const isSA = await isSuperAdmin(revokedBy);
    if (!isSA) {
      throw new Error('Only Super Admins can modify role permissions');
    }

    const supabase = await this.getClient();

    const { error } = await supabase
      .from('role_permissions')
      .update({ granted: false })
      .eq('role_id', roleId)
      .eq('permission_id', permissionId);

    if (error) {
      throw new Error(`Failed to revoke permission: ${error.message}`);
    }

    await this.logActivity('revoke_permission', 'role_permissions', roleId, {
      permission_id: permissionId,
      revoked_by: revokedBy
    });
  }

  /**
   * Suspend a user account
   */
  async suspendUser(
    targetUserId: string,
    reason: string,
    suspendedBy: string
  ): Promise<void> {
    const authorized = await this.can('suspend_users');
    if (!authorized) {
      throw new Error('User does not have permission to suspend users');
    }

    const supabase = await this.getClient();

    const { error } = await supabase
      .from('user_profiles')
      .update({
        is_suspended: true,
        suspension_reason: reason,
        suspended_at: new Date().toISOString(),
        suspended_by: suspendedBy
      })
      .eq('user_id', targetUserId);

    if (error) {
      throw new Error(`Failed to suspend user: ${error.message}`);
    }

    await this.logActivity('suspend_user', 'user_profiles', targetUserId, {
      reason,
      suspended_by: suspendedBy
    });
  }

  /**
   * Unsuspend a user account
   */
  async unsuspendUser(
    targetUserId: string,
    unsuspendedBy: string
  ): Promise<void> {
    const authorized = await this.can('suspend_users');
    if (!authorized) {
      throw new Error('User does not have permission to unsuspend users');
    }

    const supabase = await this.getClient();

    const { error } = await supabase
      .from('user_profiles')
      .update({
        is_suspended: false,
        suspension_reason: null,
        suspended_at: null,
        suspended_by: null
      })
      .eq('user_id', targetUserId);

    if (error) {
      throw new Error(`Failed to unsuspend user: ${error.message}`);
    }

    await this.logActivity('unsuspend_user', 'user_profiles', targetUserId, {
      unsuspended_by: unsuspendedBy
    });
  }

  /**
   * Log an activity
   */
  private async logActivity(
    action: string,
    resourceType: string,
    resourceId: string,
    details?: any
  ): Promise<void> {
    const supabase = await this.getClient();

    await supabase
      .from('activity_logs')
      .insert({
        user_id: this.userId,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        details
      });
  }
}

/**
 * Factory function to create an authorizer instance
 */
export function createAuthorizer(userId: string): RBACAuthorizer {
  return new RBACAuthorizer(userId);
}
