// @ts-nocheck - Supabase type inference issues with Database types
'use client';

import { X, Shield, Check } from 'lucide-react';
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

interface UserRoleAssignProps {
  user: any;
  onClose: () => void;
}

export default function UserRoleAssign({ user, onClose }: UserRoleAssignProps) {
  const [loading, setLoading] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(
    user.user_roles?.map((ur: any) => ur.roles.id) || []
  );
  const [roles, setRoles] = useState<any[]>([]);

  useState(() => {
    // Fetch roles on mount using client-side Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    supabase
      .from('roles')
      .select('*')
      .order('name')
      .then(({ data }) => {
        if (data) setRoles(data);
      });
  });

  const handleToggleRole = (roleId: string) => {
    setSelectedRoles(prev =>
      prev.includes(roleId)
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      // Get current user
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) throw new Error('Not authenticated');

      // Remove unselected roles
      const currentRoleIds = user.user_roles?.map((ur: any) => ur.roles.id) || [];
      const rolesToRemove = currentRoleIds.filter((id: string) => !selectedRoles.includes(id));
      
      for (const roleId of rolesToRemove) {
        await supabase
          .from('user_roles')
          .update({ is_active: false })
          .eq('user_id', user.id)
          .eq('role_id', roleId);
      }

      // Add newly selected roles
      const rolesToAdd = selectedRoles.filter(id => !currentRoleIds.includes(id));
      
      for (const roleId of rolesToAdd) {
        await supabase
          .from('user_roles')
          .upsert({
            user_id: user.id,
            role_id: roleId,
            assigned_by: currentUser.id,
            is_active: true
          });
      }

      // Log activity
      await supabase
        .from('activity_logs')
        .insert({
          user_id: currentUser.id,
          action: 'assign_roles',
          resource_type: 'user',
          resource_id: user.id,
          details: { roles: selectedRoles }
        });

      window.location.reload();
    } catch (error) {
      console.error('Error assigning roles:', error);
      alert('Failed to assign roles');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Assign Roles
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-3">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => handleToggleRole(role.id)}
                className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                  selectedRoles.includes(role.id)
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    selectedRoles.includes(role.id)
                      ? 'bg-red-100 dark:bg-red-900/30'
                      : 'bg-gray-100 dark:bg-gray-700'
                  }`}>
                    <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {role.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {role.description}
                    </p>
                  </div>
                </div>
                {selectedRoles.includes(role.id) && (
                  <Check className="w-5 h-5 text-red-600 dark:text-red-400" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 rounded-lg transition-colors"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
