'use client';

import { useEffect } from 'react';
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
  const pathname = usePathname();
  const router = useRouter();

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
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 z-40"
        style={{ background: 'var(--surface)', borderRight: '1px solid var(--line)', height: '100vh' }}>
        <div className="flex flex-col h-full" style={{ height: '100vh' }}>
          {/* Logo */}
          <div className="p-6 flex-shrink-0" style={{ borderBottom: '1px solid var(--line)' }}>
            <Link href="/admin" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'var(--crimson)' }}>
                <span className="text-white text-xl">🩸</span>
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{ color: 'var(--ink)' }}>রক্তকরবী</h1>
                <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>{isSuperAdmin ? 'Super Admin' : 'Admin Panel'}</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto" style={{ overflowY: 'auto' }}>
            <ul className="space-y-1">
              {filteredMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'font-medium'
                          : ''
                      }`}
                      style={{
                        background: isActive ? 'var(--crimson-tint)' : 'transparent',
                        color: isActive ? 'var(--crimson)' : 'var(--ink-muted)',
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
          <div className="p-4 space-y-2 flex-shrink-0" style={{ borderTop: '1px solid var(--line)' }}>
            <Link
              href="/dashboard"
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-colors"
              style={{ color: 'var(--ink-muted)' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--canvas)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <Home size={20} />
              <span>User Dashboard</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-colors"
              style={{ color: 'var(--ink-muted)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--crimson-tint)';
                e.currentTarget.style.color = 'var(--crimson)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--ink-muted)';
              }}
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
