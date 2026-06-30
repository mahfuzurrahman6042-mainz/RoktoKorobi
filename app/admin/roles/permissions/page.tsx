'use client';

import { useState, useEffect } from 'react';
import { database, ref, get, update } from '@/lib/firebase';
import { Shield, Edit, Save, X, Check } from 'lucide-react';

interface Role {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  hierarchy: number;
  permissions: string[];
}

const availablePermissions = [
  '/admin',
  '/admin/users',
  '/admin/roles',
  '/admin/hospitals',
  '/admin/blogs',
  '/admin/testimonials',
  '/admin/requests',
  '/admin/activity',
  '/admin/settings',
  '/admin/all'
];

export default function RolePermissionsPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [tempPermissions, setTempPermissions] = useState<string[]>([]);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      if (!database) return;
      
      const rolesRef = ref(database, 'roles');
      const snapshot = await get(rolesRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        const rolesArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setRoles(rolesArray);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (role: Role) => {
    setEditingRole(role);
    setTempPermissions([...role.permissions]);
  };

  const cancelEditing = () => {
    setEditingRole(null);
    setTempPermissions([]);
  };

  const togglePermission = (permission: string) => {
    if (tempPermissions.includes(permission)) {
      setTempPermissions(tempPermissions.filter(p => p !== permission));
    } else {
      setTempPermissions([...tempPermissions, permission]);
    }
  };

  const savePermissions = async () => {
    if (!editingRole) return;

    try {
      if (!database) return;
      
      await update(ref(database, `roles/${editingRole.id}`), {
        permissions: tempPermissions,
        updatedAt: new Date().toISOString()
      });

      setEditingRole(null);
      setTempPermissions([]);
      fetchRoles();
    } catch (error) {
      console.error('Error saving permissions:', error);
    }
  };

  const groupedRoles = roles.reduce((acc, role) => {
    if (!acc[role.category]) {
      acc[role.category] = [];
    }
    acc[role.category].push(role);
    return acc;
  }, {} as Record<string, Role[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Role Permissions</h1>
        <p className="text-gray-600 mt-2">
          Manage which pages each role can access.
        </p>
      </div>

      <div className="space-y-8">
        {Object.entries(groupedRoles).map(([category, categoryRoles]) => (
          <div key={category} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">{category}</h2>
            </div>
            
            <div className="divide-y divide-gray-200">
              {categoryRoles.map((role) => (
                <div key={role.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{role.name}</h3>
                      <p className="text-sm text-gray-500">{role.subcategory}</p>
                    </div>
                    {editingRole?.id === role.id ? (
                      <div className="flex gap-2">
                        <button
                          onClick={savePermissions}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Save size={16} />
                          Save
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          <X size={16} />
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEditing(role)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Edit size={16} />
                        Edit Permissions
                      </button>
                    )}
                  </div>

                  {editingRole?.id === role.id ? (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Select Permissions:</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {availablePermissions.map((permission) => (
                          <label
                            key={permission}
                            className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors ${
                              tempPermissions.includes(permission)
                                ? 'bg-blue-100 border-2 border-blue-500'
                                : 'bg-white border-2 border-gray-200'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={tempPermissions.includes(permission)}
                              onChange={() => togglePermission(permission)}
                              className="w-4 h-4 text-blue-600 rounded"
                            />
                            <span className="text-sm">{permission}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Current Permissions:</h4>
                      <div className="flex flex-wrap gap-2">
                        {role.permissions.length > 0 ? (
                          role.permissions.map((permission) => (
                            <span
                              key={permission}
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                            >
                              <Check size={14} className="mr-1" />
                              {permission}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500">No permissions assigned</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
