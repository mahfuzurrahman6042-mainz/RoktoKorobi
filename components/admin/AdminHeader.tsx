'use client';

import { Bell, Search, User, Shield } from 'lucide-react';
import { getCurrentUser, getAllRoles } from '@/lib/firebase';
import { useEffect, useState } from 'react';

interface AdminHeaderProps {
  user: any;
  isSuperAdmin?: boolean;
  userRole?: string | null;
}

export default function AdminHeader({ user, isSuperAdmin = false, userRole = null }: AdminHeaderProps) {
  const [currentUser, setCurrentUser] = useState(user);
  const [roleName, setRoleName] = useState<string>('');

  useEffect(() => {
    if (!user) {
      setCurrentUser(getCurrentUser());
    }
  }, [user]);

  useEffect(() => {
    if (userRole && !isSuperAdmin) {
      fetchRoleName();
    }
  }, [userRole, isSuperAdmin]);

  const fetchRoleName = async () => {
    try {
      const roles = await getAllRoles();
      const role = roles.find(r => r.id === userRole);
      if (role) {
        setRoleName(role.name);
      }
    } catch (error) {
      console.error('Error fetching role name:', error);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search users, requests, hospitals..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Role badge */}
          {!isSuperAdmin && roleName && (
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              <Shield size={16} />
              <span>{roleName}</span>
            </div>
          )}

          {/* Notifications */}
          <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full"></span>
          </button>

          {/* User info */}
          <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {currentUser?.displayName || 'Admin'}
              </p>
              <p className="text-xs text-gray-500">
                {currentUser?.email || 'admin@roktokorobi.com'}
              </p>
            </div>
            <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
              <User size={20} className="text-white" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
