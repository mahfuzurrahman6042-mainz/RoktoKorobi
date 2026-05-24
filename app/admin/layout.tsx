// @ts-nocheck - Supabase type inference issues with Database types
import { redirect } from 'next/navigation';
import { getCurrentAdminUser } from '@/lib/supabase/admin';
import AdminSidebar from '@/components/admin/layout/Sidebar';
import AdminHeader from '@/components/admin/layout/Header';
import { ToastProvider } from '@/components/admin/ui/Toast';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adminUser = await getCurrentAdminUser();
  
  if (!adminUser || adminUser.roles.length === 0) {
    redirect('/admin/login');
  }

  // Check if user account is suspended
  if (adminUser.profile && adminUser.profile.is_suspended) {
    redirect('/suspended');
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <AdminSidebar user={adminUser} />
        <div className="lg:pl-64">
          <AdminHeader user={adminUser} />
          <main className="p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
