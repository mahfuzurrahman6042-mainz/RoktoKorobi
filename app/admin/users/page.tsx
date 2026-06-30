'use client';

import { useState, useEffect } from 'react';
import { database, ref, get, update, remove, getAllRoles, assignUserRole, getCurrentUser, isSuperAdmin } from '@/lib/firebase';
import { Search, Filter, MoreVertical, Ban, Shield, Edit, Trash2, Check, UserPlus, ChevronDown } from 'lucide-react';

interface User {
  uid: string;
  name: string;
  email: string;
  bloodGroup: string;
  phone: string;
  location: string;
  isDonor: boolean;
  isBanned: boolean;
  donations: number;
  role?: string;
  roleAssignedAt?: string;
  createdAt: string;
}

interface Role {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  hierarchy: number;
  permissions: string[];
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [isSuperAdminUser, setIsSuperAdminUser] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    checkSuperAdmin();
  }, []);

  const checkSuperAdmin = async () => {
    try {
      const currentUser = getCurrentUser();
      if (currentUser) {
        const isAdmin = await isSuperAdmin(currentUser.email || '');
        setIsSuperAdminUser(isAdmin);
      }
    } catch (error) {
      console.error('Error checking super admin:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      if (!database) return;
      
      const usersRef = ref(database, 'users');
      const snapshot = await get(usersRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        const usersArray = Object.keys(data).map(key => ({
          uid: key,
          ...data[key],
          isBanned: data[key].isBanned || false
        }));
        setUsers(usersArray);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const rolesData = await getAllRoles();
      setRoles(rolesData);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const handleAssignRole = async () => {
    if (!selectedUser || !selectedRole) return;

    try {
      const currentUser = getCurrentUser();
      if (!currentUser) return;

      await assignUserRole(
        selectedUser.uid,
        selectedRole,
        currentUser.displayName || 'Admin',
        currentUser.email || ''
      );

      setShowRoleModal(false);
      setSelectedRole('');
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error assigning role:', error);
    }
  };

  const getRoleName = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    return role ? role.name : 'No Role';
  };

  const getRoleCategory = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    return role ? role.category : '';
  };

  const handleBanUser = async (user: User) => {
    if (!window.confirm(`Are you sure you want to ${user.isBanned ? 'unban' : 'ban'} this user?`)) return;

    try {
      if (!database) return;
      
      await update(ref(database, `users/${user.uid}`), {
        isBanned: !user.isBanned,
        updatedAt: new Date().toISOString()
      });
      
      fetchUsers();
      setShowActionMenu(null);
    } catch (error) {
      console.error('Error banning user:', error);
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!window.confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) return;

    try {
      if (!database) return;
      
      await remove(ref(database, `users/${user.uid}`));
      fetchUsers();
      setShowActionMenu(null);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm);
    
    const matchesFilter = 
      filterStatus === 'all' ||
      (filterStatus === 'banned' && user.isBanned) ||
      (filterStatus === 'active' && !user.isBanned);
    
    return matchesSearch && matchesFilter;
  });

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
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-2">
          Manage users, ban/unban accounts, and control access.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All Users</option>
            <option value="active">Active</option>
            <option value="banned">Banned</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-gray-500 text-sm">Total Users</p>
          <p className="text-3xl font-bold text-gray-900">{users.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-gray-500 text-sm">Active Users</p>
          <p className="text-3xl font-bold text-green-600">{users.filter(u => !u.isBanned).length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-gray-500 text-sm">Banned Users</p>
          <p className="text-3xl font-bold text-red-600">{users.filter(u => u.isBanned).length}</p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blood Group</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Donations</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.uid} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-red-600 font-medium">{user.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-900">{user.phone}</p>
                    <p className="text-sm text-gray-500">{user.location}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                      {user.bloodGroup}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {user.role ? (
                      <div>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <Shield size={12} className="mr-1" />
                          {getRoleName(user.role)}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">{getRoleCategory(user.role)}</p>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">No Role</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-900">{user.donations}</td>
                  <td className="px-6 py-4">
                    {user.isBanned ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                        <Ban size={14} className="mr-1" />
                        Banned
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        <Check size={14} className="mr-1" />
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="relative">
                      <button
                        onClick={() => setShowActionMenu(showActionMenu === user.uid ? null : user.uid)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <MoreVertical size={20} className="text-gray-500" />
                      </button>
                      
                      {showActionMenu === user.uid && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                          {isSuperAdminUser && (
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowRoleModal(true);
                                setShowActionMenu(null);
                              }}
                              className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                            >
                              <UserPlus size={16} className="text-blue-600" />
                              Assign Role
                            </button>
                          )}
                          <button
                            onClick={() => handleBanUser(user)}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                          >
                            <Ban size={16} className={user.isBanned ? 'text-green-600' : 'text-red-600'} />
                            {user.isBanned ? 'Unban User' : 'Ban User'}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-red-600"
                          >
                            <Trash2 size={16} />
                            Delete User
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No users found</p>
          </div>
        )}
      </div>

      {/* Role Assignment Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Assign Role</h2>
              <p className="text-gray-600 mt-1">
                Assign a role to {selectedUser.name} ({selectedUser.email})
              </p>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Role</label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">-- Select a Role --</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.category} - {role.subcategory} - {role.name}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedRole && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">Role Information</h3>
                    {(() => {
                      const role = roles.find(r => r.id === selectedRole);
                      return role ? (
                        <div className="space-y-2 text-sm">
                          <p><span className="font-medium">Category:</span> {role.category}</p>
                          <p><span className="font-medium">Subcategory:</span> {role.subcategory}</p>
                          <p><span className="font-medium">Permissions:</span></p>
                          <ul className="list-disc list-inside ml-2">
                            {role.permissions.map((perm, idx) => (
                              <li key={idx}>{perm}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowRoleModal(false);
                  setSelectedRole('');
                  setSelectedUser(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignRole}
                disabled={!selectedRole}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Assign Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
