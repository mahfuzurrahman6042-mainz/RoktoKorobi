import { createAdminClient } from '@/lib/supabase/admin';
import RoleTable from '@/components/admin/roles/RoleTable';
import CreateRoleModal from '@/components/admin/roles/CreateRoleModal';

export default async function RolesPage() {
  const supabase = await createAdminClient();

  const { data: roles, error } = await supabase
    .from('roles')
    .select(`
      *,
      user_roles (count)
    `)
    .order('name');

  if (error) {
    console.error('Error fetching roles:', error);
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Role Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage system roles and their permissions.
          </p>
        </div>
        <CreateRoleModal />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <RoleTable roles={roles || []} />
      </div>
    </div>
  );
}
