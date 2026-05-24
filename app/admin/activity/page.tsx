import { createAdminClient } from '@/lib/supabase/admin';
import ActivityTable from '@/components/admin/activity/ActivityTable';

export default async function ActivityPage({
  searchParams,
}: {
  searchParams: { page?: string; action?: string; userId?: string };
}) {
  const supabase = await createAdminClient();
  
  const page = parseInt(searchParams.page || '1');
  const limit = 50;
  const offset = (page - 1) * limit;
  
  let query = supabase
    .from('activity_logs')
    .select(`
      *,
      user_profiles (
        full_name
      )
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (searchParams.action) {
    query = query.eq('action', searchParams.action);
  }

  if (searchParams.userId) {
    query = query.eq('user_id', searchParams.userId);
  }

  const { data: activities, count, error } = await query;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Activity Logs</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Track all admin actions and system events.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <ActivityTable 
          activities={activities || []}
          totalCount={count || 0}
          currentPage={page}
          limit={limit}
        />
      </div>
    </div>
  );
}
