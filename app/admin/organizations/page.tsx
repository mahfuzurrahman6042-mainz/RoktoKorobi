import { createAdminClient } from '@/lib/supabase/admin';
import OrganizationTable from '@/components/admin/organizations/OrganizationTable';
import Link from 'next/link';

export default async function OrganizationsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  const supabase = await createAdminClient();
  const resolvedSearchParams = await searchParams;
  
  const page = parseInt(resolvedSearchParams.page || '1');
  const limit = 20;
  const offset = (page - 1) * limit;
  
  let query = supabase
    .from('organizations')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (resolvedSearchParams.status === 'active') {
    query = query.eq('is_active', true);
  } else if (resolvedSearchParams.status === 'inactive') {
    query = query.eq('is_active', false);
  }

  const { data: organizations, count, error } = await query;

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Organizations</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage blood donation organizations and their representatives.
          </p>
        </div>
        <Link
          href="/super-admin/partner-onboard"
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          Activate Partner
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <OrganizationTable 
          organizations={organizations || []}
          totalCount={count || 0}
          currentPage={page}
          limit={limit}
        />
      </div>
    </div>
  );
}
