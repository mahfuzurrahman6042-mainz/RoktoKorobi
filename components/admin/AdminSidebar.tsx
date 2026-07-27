'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Users,
  ShieldCheck,
  Building2,
  FileText,
  MessageSquare,
  HeartPulse,
  Activity,
  Settings,
  LogOut,
  Menu,
  X,
  Home
} from 'lucide-react';
import { logoutUser } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

const NAV_ITEMS = [
  { key: 'users', label: 'Users', icon: Users, href: '/admin/users' },
  { key: 'roles', label: 'Roles', icon: ShieldCheck, href: '/admin/roles' },
  { key: 'hospitals', label: 'Hospitals', icon: Building2, href: '/admin/hospitals' },
  { key: 'blogs', label: 'Blogs', icon: FileText, href: '/admin/blogs' },
  { key: 'testimonials', label: 'Testimonials', icon: MessageSquare, href: '/admin/testimonials' },
  { key: 'requests', label: 'Blood Requests', icon: HeartPulse, href: '/admin/requests' },
  { key: 'activity', label: 'Activity Log', icon: Activity, href: '/admin/activity' },
  { key: 'settings', label: 'Settings', icon: Settings, href: '/admin/settings' },
];

interface AdminSidebarProps {
  isSuperAdmin?: boolean;
  userRole?: string | null;
  userPermissions?: string[];
}

export default function AdminSidebar({ isSuperAdmin = false, userRole = null, userPermissions = [] }: AdminSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Close mobile menu when pathname changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Lock body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      await logoutUser();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Filter menu items based on permissions
  const filteredMenuItems = isSuperAdmin
    ? NAV_ITEMS
    : NAV_ITEMS.filter(item =>
        userPermissions.includes('/admin/all') ||
        userPermissions.includes(item.href)
      );

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg shadow-md"
        style={{ background: '#ffffff', border: '1px solid #e2e8f0' }}
      >
        <Menu size={24} />
      </button>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:w-64 lg:flex-shrink-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: '#ffffff', borderRight: '1px solid #e2e8f0' }}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 flex-shrink-0 flex items-center justify-between" style={{ borderBottom: '1px solid #e2e8f0' }}>
            <Link href="/admin" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#dc2626' }}>
                <span className="text-white text-xl">🩸</span>
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{ color: '#1A0F0A' }}>রক্তকরবী</h1>
                <p className="text-xs" style={{ color: '#64748b' }}>{isSuperAdmin ? 'Super Admin' : 'Admin Panel'}</p>
              </div>
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-2 rounded-lg"
              style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-1">
              {filteredMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'font-medium'
                          : ''
                      }`}
                      style={{
                        background: isActive ? 'rgba(220, 38, 38, 0.08)' : 'transparent',
                        color: isActive ? '#dc2626' : '#64748b',
                      }}
                    >
                      <Icon size={20} />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User section */}
          <div className="p-4 space-y-2 flex-shrink-0" style={{ borderTop: '1px solid #e2e8f0' }}>
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-colors"
              style={{ color: '#64748b' }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <Home size={20} />
              <span>User Dashboard</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-colors"
              style={{ color: '#64748b' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(220, 38, 38, 0.08)';
                e.currentTarget.style.color = '#dc2626';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#64748b';
              }}
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: 'rgba(0, 0, 0, 0.4)' }}
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
