import { createAdminClient } from '@/lib/supabase/admin';
import PermissionGrid from '@/components/admin/permissions/PermissionGrid';

export default async function PermissionsPage() {
  const supabase = await createAdminClient();

  const [roles, permissions] = await Promise.all([
    supabase.from('roles').select('*').order('name'),
    supabase.from('permissions').select('*').order('category', { ascending: true })
  ]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Permissions Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage permissions for each role in the system.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <PermissionGrid 
          roles={roles?.data || []}
          permissions={permissions?.data || []}
        />
      </div>
    </div>
  );
}
