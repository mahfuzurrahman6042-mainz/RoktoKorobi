// @ts-nocheck - Supabase type inference issues with Database types
'use client';

import React, { useState } from 'react';
import { Shield, Check, X } from 'lucide-react';

interface PermissionGridProps {
  roles: any[];
  permissions: any[];
}

export default function PermissionGrid({ roles, permissions }: PermissionGridProps) {
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);

  // Group permissions by category
  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.category || 'other']) {
      acc[perm.category || 'other'] = [];
    }
    acc[perm.category || 'other'].push(perm);
    return acc;
  }, {} as Record<string, any[]>);

  const handleTogglePermission = async (roleId: string, permissionId: string, granted: boolean) => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/permissions/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleId, permissionId, granted })
      });

      if (!response.ok) {
        throw new Error('Failed to update permission');
      }

      // Update local state
      setRolePermissions(prev => {
        const newRolePerms = { ...prev };
        if (!newRolePerms[roleId]) {
          newRolePerms[roleId] = [];
        }
        if (granted) {
          newRolePerms[roleId].push(permissionId);
        } else {
          newRolePerms[roleId] = newRolePerms[roleId].filter(id => id !== permissionId);
        }
        return newRolePerms;
      });
    } catch (error) {
      console.error('Error toggling permission:', error);
      alert('Failed to update permission');
    } finally {
      setLoading(false);
    }
  };

  const isPermissionGranted = (roleId: string, permissionId: string) => {
    // This would normally come from the data, but for now we'll use local state
    return rolePermissions[roleId]?.includes(permissionId) || false;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider min-w-[200px]">
              Permission
            </th>
            {roles.map((role) => (
              <th key={role.id} className="text-center px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                {role.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.entries(groupedPermissions).map(([category, perms]) => (
            <React.Fragment key={category}>
              <tr className="bg-gray-50 dark:bg-gray-900/30">
                <td colSpan={roles.length + 1} className="px-6 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  {category}
                </td>
              </tr>
              {perms.map((perm) => (
                <tr key={perm.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {perm.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {perm.description}
                      </p>
                    </div>
                  </td>
                  {roles.map((role) => (
                    <td key={role.id} className="px-4 py-4 text-center">
                      {role.name === 'super_admin' ? (
                        <div className="flex items-center justify-center">
                          <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                      ) : (
                        <button
                          onClick={() => handleTogglePermission(role.id, perm.id, !isPermissionGranted(role.id, perm.id))}
                          disabled={loading}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                            isPermissionGranted(role.id, perm.id)
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          {isPermissionGranted(role.id, perm.id) ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
