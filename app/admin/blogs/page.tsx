import { createAdminClient } from '@/lib/supabase/admin';
import BlogTable from '@/components/admin/blogs/BlogTable';

export default async function BlogsPage({
  searchParams,
}: {
  searchParams: { page?: string; status?: string };
}) {
  const supabase = await createAdminClient();
  
  const page = parseInt(searchParams.page || '1');
  const limit = 20;
  const offset = (page - 1) * limit;
  
  let query = supabase
    .from('blogs')
    .select(`
      *,
      user_profiles (
        full_name
      )
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (searchParams.status === 'published') {
    query = query.eq('is_published', true);
  } else if (searchParams.status === 'draft') {
    query = query.eq('is_published', false);
  }

  const { data: blogs, count, error } = await query;

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Blog Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Create, edit, and manage blog posts.
          </p>
        </div>
        <a
          href="/admin/blogs/new"
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          New Blog Post
        </a>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <BlogTable 
          blogs={blogs || []}
          totalCount={count || 0}
          currentPage={page}
          limit={limit}
        />
      </div>
    </div>
  );
}
