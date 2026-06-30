'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  FileText, 
  MessageSquare, 
  Heart, 
  Activity,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  UserCog,
  Home
} from 'lucide-react';
import { logoutUser } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

const allMenuItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard', permission: '/admin' },
  { href: '/admin/users', icon: Users, label: 'Users', permission: '/admin/users' },
  { href: '/admin/roles', icon: Shield, label: 'Roles', permission: '/admin/roles' },
  { href: '/admin/hospitals', icon: Building2, label: 'Hospitals', permission: '/admin/hospitals' },
  { href: '/admin/blogs', icon: FileText, label: 'Blogs', permission: '/admin/blogs' },
  { href: '/admin/testimonials', icon: MessageSquare, label: 'Testimonials', permission: '/admin/testimonials' },
  { href: '/admin/requests', icon: Heart, label: 'Blood Requests', permission: '/admin/requests' },
  { href: '/admin/activity', icon: Activity, label: 'Activity Log', permission: '/admin/activity' },
  { href: '/admin/settings', icon: Settings, label: 'Settings', permission: '/admin/settings' },
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
    ? allMenuItems 
    : allMenuItems.filter(item => 
        userPermissions.includes('/admin/all') || 
        userPermissions.includes(item.permission)
      );

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-40 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">🩸</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">রক্তকরবী</h1>
                <p className="text-xs text-gray-500">{isSuperAdmin ? 'Super Admin' : 'Admin Panel'}</p>
              </div>
            </Link>
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
                          ? 'bg-red-50 text-red-600 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
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
          <div className="p-4 border-t border-gray-200 space-y-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Home size={20} />
              <span>User Dashboard</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
