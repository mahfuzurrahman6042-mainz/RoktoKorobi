'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getCurrentUser, isSuperAdmin, getUserRole, getRolePermissions, hasPageAccess } from '@/lib/firebase';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [isSuperAdminUser, setIsSuperAdminUser] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const user = getCurrentUser();
        if (!user) {
          router.push('/login');
          return;
        }

        setCurrentUser(user);

        // Check if super admin
        const adminCheck = await isSuperAdmin(user.email || '');
        if (adminCheck) {
          setIsSuperAdminUser(true);
          setHasAccess(true);
          setLoading(false);
          return;
        }

        // Check if user has a role
        const roleId = await getUserRole(user.uid);
        if (!roleId) {
          router.push('/dashboard');
          return;
        }

        setUserRole(roleId);

        // Get role permissions
        const permissions = await getRolePermissions(roleId);
        setUserPermissions(permissions);

        // Check if user has access to current page
        const pageAccess = await hasPageAccess(user.uid, pathname);
        if (!pageAccess) {
          router.push('/dashboard');
          return;
        }

        setHasAccess(true);
      } catch (error) {
        console.error('Access check error:', error);
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar 
        isSuperAdmin={isSuperAdminUser}
        userRole={userRole}
        userPermissions={userPermissions}
      />
      <div className="lg:pl-64">
        <AdminHeader 
          user={currentUser} 
          isSuperAdmin={isSuperAdminUser}
          userRole={userRole}
        />
        <main className="p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
