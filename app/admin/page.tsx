'use client';

import { useState, useEffect } from 'react';
import { database, ref, get } from '@/lib/firebase';
import { Users, Building2, FileText, MessageSquare, Heart, Activity, TrendingUp, AlertTriangle } from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalHospitals: number;
  totalBlogs: number;
  totalTestimonials: number;
  pendingTestimonials: number;
  totalRequests: number;
  pendingRequests: number;
  criticalRequests: number;
  recentActivities: any[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalHospitals: 0,
    totalBlogs: 0,
    totalTestimonials: 0,
    pendingTestimonials: 0,
    totalRequests: 0,
    pendingRequests: 0,
    criticalRequests: 0,
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      if (!database) return;

      const [
        usersSnapshot,
        hospitalsSnapshot,
        blogsSnapshot,
        testimonialsSnapshot,
        requestsSnapshot,
        activitiesSnapshot
      ] = await Promise.all([
        get(ref(database, 'users')),
        get(ref(database, 'hospitals')),
        get(ref(database, 'blogPosts')),
        get(ref(database, 'testimonials')),
        get(ref(database, 'bloodRequests')),
        get(ref(database, 'activityLogs'))
      ]);

      const users = usersSnapshot.exists() ? Object.keys(usersSnapshot.val()).length : 0;
      const hospitals = hospitalsSnapshot.exists() ? Object.keys(hospitalsSnapshot.val()).length : 0;
      const blogsData = blogsSnapshot.exists() ? blogsSnapshot.val() : {};
      const blogs = Object.keys(blogsData).length;
      const testimonialsData = testimonialsSnapshot.exists() ? testimonialsSnapshot.val() : {};
      const testimonials = Object.keys(testimonialsData);
      const pendingTestimonials = testimonials.filter(key => !testimonialsData[key].verified).length;
      const requestsData = requestsSnapshot.exists() ? requestsSnapshot.val() : {};
      const requests = Object.keys(requestsData);
      const totalRequests = requests.length;
      const pendingRequests = requests.filter(key => !requestsData[key].fulfilled).length;
      const criticalRequests = requests.filter(key => 
        !requestsData[key].fulfilled && requestsData[key].urgency === 'Critical'
      ).length;
      
      const activitiesData = activitiesSnapshot.exists() ? activitiesSnapshot.val() : {};
      const recentActivities = Object.keys(activitiesData)
        .map(key => ({ id: key, ...activitiesData[key] }))
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10);

      setStats({
        totalUsers: users,
        totalHospitals: hospitals,
        totalBlogs: blogs,
        totalTestimonials: testimonials.length,
        pendingTestimonials,
        totalRequests,
        pendingRequests,
        criticalRequests,
        recentActivities
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      name: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600'
    },
    {
      name: 'Hospitals',
      value: stats.totalHospitals,
      icon: Building2,
      color: 'bg-green-500',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600'
    },
    {
      name: 'Blog Posts',
      value: stats.totalBlogs,
      icon: FileText,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600'
    },
    {
      name: 'Testimonials',
      value: stats.totalTestimonials,
      icon: MessageSquare,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-600'
    },
    {
      name: 'Blood Requests',
      value: stats.totalRequests,
      icon: Heart,
      color: 'bg-red-500',
      bgColor: 'bg-red-100',
      textColor: 'text-red-600'
    },
    {
      name: 'Pending Requests',
      value: stats.pendingRequests,
      icon: Activity,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-600'
    },
    {
      name: 'Critical Requests',
      value: stats.criticalRequests,
      icon: AlertTriangle,
      color: 'bg-red-600',
      bgColor: 'bg-red-100',
      textColor: 'text-red-600'
    },
    {
      name: 'Pending Testimonials',
      value: stats.pendingTestimonials,
      icon: TrendingUp,
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-100',
      textColor: 'text-indigo-600'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back! Here's what's happening in your platform.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.bgColor}`}>
                  <Icon size={24} className={stat.textColor} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <a href="/admin/users" className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <Users size={20} className="text-blue-600" />
            <span className="font-medium text-gray-900">Manage Users</span>
          </a>
          <a href="/admin/hospitals" className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <Building2 size={20} className="text-green-600" />
            <span className="font-medium text-gray-900">Add Hospital</span>
          </a>
          <a href="/admin/blogs" className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <FileText size={20} className="text-purple-600" />
            <span className="font-medium text-gray-900">Write Blog</span>
          </a>
          <a href="/admin/requests" className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <Heart size={20} className="text-red-600" />
            <span className="font-medium text-gray-900">View Requests</span>
          </a>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
        {stats.recentActivities.length > 0 ? (
          <div className="space-y-4">
            {stats.recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Activity size={20} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{activity.action.replace(/_/g, ' ')}</p>
                  <p className="text-sm text-gray-600">{activity.details}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {activity.performedBy} • {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Activity size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No recent activity</p>
          </div>
        )}
      </div>
    </div>
  );
}
