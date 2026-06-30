'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { database, ref, get, getAllRoles, initializeRoles } from '@/lib/firebase';
import { Shield, Settings, RefreshCw, Crown, User, ChevronRight } from 'lucide-react';

interface Role {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  hierarchy: number;
  permissions: string[];
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const rolesData = await getAllRoles();
      setRoles(rolesData);
    } catch (error) {
      console.error('Error fetching roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInitializeRoles = async () => {
    if (!window.confirm('This will initialize all foundation roles in Firebase. Continue?')) return;
    
    setInitializing(true);
    try {
      const result = await initializeRoles();
      alert(`Successfully initialized ${result.count} roles!`);
      fetchRoles();
    } catch (error) {
      console.error('Error initializing roles:', error);
      alert('Error initializing roles. Check console for details.');
    } finally {
      setInitializing(false);
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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Foundation Roles</h1>
          <p className="text-gray-600 mt-2">
            View organizational structure and role assignments.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleInitializeRoles}
            disabled={initializing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={20} className={initializing ? 'animate-spin' : ''} />
            {initializing ? 'Initializing...' : 'Initialize Roles'}
          </button>
          <Link
            href="/admin/roles/permissions"
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Settings size={20} />
            Edit Permissions
          </Link>
        </div>
      </div>

      {/* Super Admin Info */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Crown size={24} className="text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Super Admin</h3>
            <p className="text-sm text-gray-600">
              The Super Admin (President & Founder) has full access to all features and permissions. 
              Use the User Management page to assign roles to users.
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-gray-500 text-sm">Total Roles</p>
          <p className="text-3xl font-bold text-gray-900">{roles.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-gray-500 text-sm">Categories</p>
          <p className="text-3xl font-bold text-gray-900">{Object.keys(groupedRoles).length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-gray-500 text-sm">Hierarchy Levels</p>
          <p className="text-3xl font-bold text-gray-900">{Math.max(...roles.map(r => r.hierarchy))}</p>
        </div>
      </div>

      {/* Roles by Category */}
      <div className="space-y-8">
        {Object.entries(groupedRoles).map(([category, categoryRoles]) => (
          <div key={category} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">{category}</h2>
              <span className="text-sm text-gray-500">{categoryRoles.length} roles</span>
            </div>
            
            <div className="divide-y divide-gray-200">
              {categoryRoles.map((role) => (
                <div key={role.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Shield size={24} className="text-red-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{role.name}</h3>
                        <p className="text-sm text-gray-500">{role.subcategory}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {role.permissions.includes('/admin/all') ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Full Access
                            </span>
                          ) : (
                            role.permissions.map((permission) => (
                              <span
                                key={permission}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {permission}
                              </span>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {roles.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Shield size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 mb-4">No roles found in Firebase</p>
          <button
            onClick={handleInitializeRoles}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Initialize Foundation Roles
          </button>
        </div>
      )}
    </div>
  );
}
