import { createAdminClient } from '@/lib/supabase/admin';
import TestimonialTable from '@/components/admin/testimonials/TestimonialTable';

export default async function TestimonialsPage({
  searchParams,
}: {
  searchParams: { page?: string; status?: string };
}) {
  const supabase = await createAdminClient();
  
  const page = parseInt(searchParams.page || '1');
  const limit = 20;
  const offset = (page - 1) * limit;
  
  let query = supabase
    .from('testimonials')
    .select(`
      *,
      user_profiles (
        full_name
      )
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (searchParams.status === 'pending') {
    query = query.eq('is_approved', false);
  } else if (searchParams.status === 'approved') {
    query = query.eq('is_approved', true);
  }

  const { data: testimonials, count, error } = await query;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Testimonial Approval</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Review and approve user-submitted testimonials.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <TestimonialTable 
          testimonials={testimonials || []}
          totalCount={count || 0}
          currentPage={page}
          limit={limit}
        />
      </div>
    </div>
  );
}
