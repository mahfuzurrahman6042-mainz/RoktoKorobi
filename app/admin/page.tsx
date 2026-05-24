import { createAdminClient } from '@/lib/supabase/admin';
import StatsCard from '@/components/admin/dashboard/StatsCard';
import RecentActivity from '@/components/admin/dashboard/RecentActivity';

export default async function AdminDashboard() {
  const supabase = await createAdminClient();

  // Fetch dashboard statistics
  const [
    { count: userCount },
    { count: blogCount },
    { count: testimonialCount },
    { count: pendingTestimonials },
    { data: recentActivities }
  ] = await Promise.all([
    supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
    supabase.from('blogs').select('*', { count: 'exact', head: true }),
    supabase.from('testimonials').select('*', { count: 'exact', head: true }),
    supabase.from('testimonials').select('*', { count: 'exact', head: true }).eq('is_approved', false),
    supabase
      .from('activity_logs')
      .select(`
        *,
        user_profiles (
          full_name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(10)
  ]);

  const stats = [
    {
      name: 'Total Users',
      value: userCount || 0,
      change: '+12%',
      changeType: 'positive' as const,
      icon: 'users'
    },
    {
      name: 'Blog Posts',
      value: blogCount || 0,
      change: '+5%',
      changeType: 'positive' as const,
      icon: 'file'
    },
    {
      name: 'Testimonials',
      value: testimonialCount || 0,
      change: '+8%',
      changeType: 'positive' as const,
      icon: 'message'
    },
    {
      name: 'Pending Approval',
      value: pendingTestimonials || 0,
      change: '-2%',
      changeType: 'negative' as const,
      icon: 'clock'
    }
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Welcome back! Here's what's happening in your platform.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <StatsCard key={stat.name} stat={stat} />
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Recent Activity
        </h2>
        <RecentActivity activities={recentActivities || []} />
      </div>
    </div>
  );
}
