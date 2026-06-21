'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Shield, 
  Key, 
  FileText, 
  Image as ImageIcon, 
  MessageSquare, 
  Building2, 
  Activity, 
  Settings, 
  Home,
  LogOut,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import RoktokorobiLogo from '@/src/assets/roktokorobi-logo.png';

interface SidebarProps {
  user: any;
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    permission: 'access_admin_dashboard'
  },
  {
    name: 'User Management',
    href: '/admin/users',
    icon: Users,
    permission: 'manage_users'
  },
  {
    name: 'Roles',
    href: '/admin/roles',
    icon: Shield,
    permission: 'assign_roles'
  },
  {
    name: 'Permissions',
    href: '/admin/permissions',
    icon: Key,
    permission: 'manage_settings'
  },
  {
    name: 'Blogs',
    href: '/admin/blogs',
    icon: FileText,
    permission: 'create_blog'
  },
  {
    name: 'Illustrations',
    href: '/admin/illustrations',
    icon: ImageIcon,
    permission: 'publish_illustrations'
  },
  {
    name: 'Testimonials',
    href: '/admin/testimonials',
    icon: MessageSquare,
    permission: 'approve_testimonials'
  },
  {
    name: 'Organizations',
    href: '/admin/organizations',
    icon: Building2,
    permission: 'manage_organizations'
  },
  {
    name: 'Hospitals',
    href: '/admin/hospitals',
    icon: Building2,
    permission: 'manage_hospitals'
  },
  {
    name: 'Activity Logs',
    href: '/admin/activity',
    icon: Activity,
    permission: 'view_activity_logs'
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    permission: 'manage_settings'
  }
];

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(true);
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/admin/login';
  };

  const isSuperAdmin = user.roles?.some((r: any) => r.name === 'super_admin');

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 lg:block">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <img 
              src={RoktokorobiLogo.src} 
              alt="Roktokorobi — Blood Donation Organization Logo" 
              style={{ height: '32px', width: 'auto', display: 'block' }}
            />
            <span className="font-bold text-lg text-gray-900 dark:text-white">Admin</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          <div className="mb-6">
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Go to Main Website</span>
            </Link>
          </div>

          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const hasPermission = isSuperAdmin || user.roles?.some((r: any) => 
              r.permissions?.some((p: any) => p.name === item.permission)
            );

            if (!hasPermission) return null;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <span className="text-red-600 dark:text-red-400 font-semibold">
                {user.user?.email?.[0].toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user.profile?.full_name || user.user?.email}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user.roles?.map((r: any) => r.name).join(', ')}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
