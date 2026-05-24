'use client';

import { Shield, Users, Edit, Trash2, MoreVertical } from 'lucide-react';
import { useState } from 'react';

interface RoleTableProps {
  roles: any[];
}

export default function RoleTable({ roles }: RoleTableProps) {
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteRole = async (roleId: string) => {
    try {
      const response = await fetch('/api/admin/roles/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleId })
      });

      if (!response.ok) {
        throw new Error('Failed to delete role');
      }

      window.location.reload();
    } catch (error) {
      console.error('Error deleting role:', error);
      alert('Failed to delete role');
    }
  };

  return (
    <>
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Role Name
            </th>
            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Description
            </th>
            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Users
            </th>
            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Created
            </th>
            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {roles.map((role) => (
            <tr key={role.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {role.name}
                    </p>
                    {role.name === 'super_admin' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                        System
                      </span>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {role.description || 'No description'}
                </p>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Users className="w-4 h-4" />
                  {role.user_roles?.[0]?.count || 0}
                </div>
              </td>
              <td className="px-6 py-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(role.created_at).toLocaleDateString()}
                </p>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <button
                    className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="Edit Role"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  {role.name !== 'super_admin' && role.name !== 'user' && (
                    <button
                      onClick={() => {
                        setSelectedRole(role);
                        setShowDeleteModal(true);
                      }}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      title="Delete Role"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showDeleteModal && selectedRole && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Delete Role
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete the role <strong>{selectedRole.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedRole(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteRole(selectedRole.id)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Delete Role
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
