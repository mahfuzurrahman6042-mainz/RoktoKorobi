import { createAdminClient } from '@/lib/supabase/admin';
import UserTable from '@/components/admin/users/UserTable';
import UserFilters from '@/components/admin/users/UserFilters';

export default async function UsersPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string; role?: string; status?: string };
}) {
  const supabase = await createAdminClient();
  
  const page = parseInt(searchParams.page || '1');
  const limit = 20;
  const offset = (page - 1) * limit;
  
  // Build query
  let query = supabase
    .from('user_profiles')
    .select(`
      *,
      user_roles (
        roles (
          id,
          name,
          description
        )
      ),
      auth.users!user_profiles_user_id_fkey (
        email,
        created_at,
        last_sign_in_at
      )
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  // Apply filters
  if (searchParams.search) {
    query = query.or(`full_name.ilike.%${searchParams.search}%,email.ilike.%${searchParams.search}%`);
  }

  if (searchParams.role) {
    query = query.contains('user_roles.roles.name', [searchParams.role]);
  }

  if (searchParams.status === 'suspended') {
    query = query.eq('is_suspended', true);
  } else if (searchParams.status === 'active') {
    query = query.eq('is_suspended', false);
  }

  const { data: users, count, error } = await query;

  if (error) {
    console.error('Error fetching users:', error);
  }

  // Fetch roles for filter dropdown
  const { data: roles } = await supabase
    .from('roles')
    .select('id, name, description')
    .order('name');

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage users, assign roles, and control access.
        </p>
      </div>

      <UserFilters 
        currentSearch={searchParams.search}
        currentRole={searchParams.role}
        currentStatus={searchParams.status}
        roles={roles || []}
      />

      <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <UserTable 
          users={users || []}
          totalCount={count || 0}
          currentPage={page}
          limit={limit}
        />
      </div>
    </div>
  );
}
