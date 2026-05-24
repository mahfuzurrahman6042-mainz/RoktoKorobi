import { createAdminClient } from '@/lib/supabase/admin';
import HospitalTable from '@/components/admin/hospitals/HospitalTable';

export default async function HospitalsPage({
  searchParams,
}: {
  searchParams: { page?: string; status?: string; organizationId?: string };
}) {
  const supabase = await createAdminClient();
  
  const page = parseInt(searchParams.page || '1');
  const limit = 20;
  const offset = (page - 1) * limit;
  
  let query = supabase
    .from('hospitals')
    .select(`
      *,
      organizations (
        name
      )
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (searchParams.status === 'active') {
    query = query.eq('is_active', true);
  } else if (searchParams.status === 'inactive') {
    query = query.eq('is_active', false);
  }

  if (searchParams.organizationId) {
    query = query.eq('organization_id', searchParams.organizationId);
  }

  const { data: hospitals, count, error } = await query;

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Hospitals</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage hospitals and blood donation centers.
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          Add Hospital
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <HospitalTable 
          hospitals={hospitals || []}
          totalCount={count || 0}
          currentPage={page}
          limit={limit}
        />
      </div>
    </div>
  );
}
