'use client';

import { Bell, Search, User, ShieldCheck } from 'lucide-react';
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
    <header className="sticky top-0 z-30" style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
      <div className="flex items-center justify-between px-6 py-4">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2" size={16} style={{ color: '#64748b' }} />
            <input
              type="text"
              placeholder="Search users, requests, hospitals..."
              className="w-full pl-10 pr-4 py-2 rounded-lg text-sm outline-none transition-colors"
              style={{
                border: '1px solid #e2e8f0',
                background: '#f8fafc',
                color: '#1A0F0A',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#dc2626';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(220, 38, 38, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Role badge */}
          {!isSuperAdmin && roleName && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full text-sm" style={{ background: 'rgba(30, 58, 95, 0.08)', color: '#1e3a5f' }}>
              <ShieldCheck size={16} />
              <span>{roleName}</span>
            </div>
          )}

          {/* Notifications */}
          <button className="relative p-2 rounded-lg transition-colors" style={{ color: '#64748b' }}>
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ background: '#dc2626' }}></span>
          </button>

          {/* User info */}
          <div className="flex items-center gap-3 pl-4" style={{ borderLeft: '1px solid #e2e8f0' }}>
            <div className="text-right">
              <p className="text-sm font-medium" style={{ color: '#1A0F0A' }}>
                {currentUser?.displayName || 'Admin'}
              </p>
              <p className="text-xs" style={{ color: '#64748b' }}>
                {currentUser?.email || 'admin@roktokorobi.com'}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#1e3a5f' }}>
              <User size={20} style={{ color: 'white' }} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
