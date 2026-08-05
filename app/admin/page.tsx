'use client';

import { useState, useEffect } from 'react';
import { database, ref, get } from '@/lib/firebase';
import { Users, Building2, FileText, MessageSquare, Heart, Activity, UserPlus, PenLine, ImageIcon, Eye, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

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

const PRIMARY_STATS = [
  { key: 'users', label: 'Total Users', icon: Users, tone: 'navy', value: 0 },
  { key: 'hospitals', label: 'Hospitals', icon: Building2, tone: 'green', value: 0 },
  { key: 'blogs', label: 'Blog Posts', icon: FileText, tone: 'navy', value: 0 },
  { key: 'testimonials', label: 'Testimonials', icon: MessageSquare, tone: 'amber', value: 0 },
];

const SECONDARY_STATS = [
  { key: 'requests', label: 'Blood Requests', icon: Heart, tone: 'crimson', value: 0 },
  { key: 'pending', label: 'Pending Requests', icon: Activity, tone: 'amber', value: 0 },
  { key: 'critical', label: 'Critical Requests', icon: Activity, tone: 'crimson', value: 0 },
  { key: 'verified', label: 'Verified Testimonials', icon: MessageSquare, tone: 'green', value: 0 },
];

const TONE = {
  crimson: { bg: 'rgba(220, 38, 38, 0.08)', fg: '#dc2626' },
  navy: { bg: 'rgba(30, 58, 95, 0.08)', fg: '#1e3a5f' },
  amber: { bg: 'rgba(245, 158, 11, 0.08)', fg: '#f59e0b' },
  green: { bg: 'rgba(16, 185, 129, 0.08)', fg: '#10b981' },
  ink: { bg: '#EEF0F1', fg: '#1A0F0A' },
};

const ACTIVITY_META = {
  user: { label: 'User', tone: 'navy' },
  role: { label: 'Role change', tone: 'crimson' },
  ban: { label: 'Ban / unban', tone: 'amber' },
  hospital: { label: 'Hospital', tone: 'green' },
  blog: { label: 'Blog', tone: 'navy' },
  chitrokothon: { label: 'Chitrokothon', tone: 'crimson' },
  request: { label: 'Blood request', tone: 'crimson' },
  testimonial: { label: 'Testimonial', tone: 'amber' },
};

function StatCard({ stat, size = 'lg' }: { stat: any; size?: 'lg' | 'sm' }) {
  const tone = TONE[stat.tone as keyof typeof TONE] || TONE.ink;
  const Icon = stat.icon;
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 16 }} className={`flex flex-col ${size === 'lg' ? 'p-5 gap-4' : 'p-4 gap-3'} transition hover:shadow-sm`}>
      <div style={{ background: tone.bg, color: tone.fg }} className={`flex items-center justify-center rounded-full ${size === 'lg' ? 'w-10 h-10' : 'w-8 h-8'}`}>
        <Icon size={size === 'lg' ? 18 : 15} strokeWidth={2} />
      </div>
      <div>
        <div className={size === 'lg' ? 'text-3xl font-medium leading-none' : 'text-xl font-medium leading-none'}>
          {stat.value}
        </div>
        <div style={{ color: 'var(--ink-muted)' }} className={`mt-2 ${size === 'lg' ? 'text-sm' : 'text-xs'}`}>
          {stat.label}
        </div>
      </div>
    </div>
  );
}

function PulseLine({ height = 36 }: { height?: number }) {
  const width = 400;
  const path = `M0,20 L${width * 0.32},20 L${width * 0.38},4 L${width * 0.44},36 L${width * 0.5},10 L${width * 0.56},20 L${width},20`;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height, display: 'block' }} preserveAspectRatio="none">
      <path d={path} fill="none" stroke="var(--crimson)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />
    </svg>
  );
}

function fmtTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

export default function AdminDashboard() {
  const router = useRouter();
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
        .slice(0, 3);

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

  const quickActions = [
    { key: 'user', label: 'Add a user', desc: 'Search users and assign roles', icon: UserPlus, page: 'users' },
    { key: 'hospital', label: 'Add a hospital', desc: 'Register a new partner facility', icon: Building2, page: 'hospitals' },
    { key: 'blog', label: 'Write a blog post', desc: 'Share news, guidance, or a donor story', icon: PenLine, page: 'blogs' },
    { key: 'chitrokothon', label: 'Post Chitrokothon', desc: 'Share an illustrated story with a caption', icon: ImageIcon, page: 'chitrokothon' },
    { key: 'requests', label: 'View requests', desc: 'Review incoming blood requests', icon: Eye, page: 'requests' },
  ];

  const primaryStatsWithValues = PRIMARY_STATS.map(stat => {
    switch (stat.key) {
      case 'users': return { ...stat, value: stats.totalUsers };
      case 'hospitals': return { ...stat, value: stats.totalHospitals };
      case 'blogs': return { ...stat, value: stats.totalBlogs };
      case 'testimonials': return { ...stat, value: stats.totalTestimonials };
      default: return stat;
    }
  });

  const secondaryStatsWithValues = SECONDARY_STATS.map(stat => {
    switch (stat.key) {
      case 'requests': return { ...stat, value: stats.totalRequests };
      case 'pending': return { ...stat, value: stats.pendingRequests };
      case 'critical': return { ...stat, value: stats.criticalRequests };
      case 'verified': return { ...stat, value: stats.totalTestimonials - stats.pendingTestimonials };
      default: return stat;
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#dc2626' }}></div>
      </div>
    );
  }

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="max-w-6xl">
      <div className="flex items-end justify-between flex-wrap gap-3 mb-8">
        <div>
          <h1 style={{ fontFamily: "'IBM Plex Serif', serif" }} className="text-[28px] font-semibold leading-tight">
            {greeting}, Admin
          </h1>
          <p style={{ color: '#64748b' }} className="text-sm mt-1.5">
            Here's the state of the platform today.
          </p>
        </div>
        <div style={{ color: '#64748b' }} className="text-xs">
          {now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
      </div>

      <div className="mb-3 flex items-center gap-2">
        <span style={{ color: '#991b1b', letterSpacing: '0.1em' }} className="text-[11px] uppercase font-medium">
          Platform Vitals
        </span>
        <span style={{ background: '#dc2626' }} className="w-1.5 h-1.5 rounded-full animate-pulse" />
      </div>
      <div className="-mt-1 mb-4">
        <PulseLine />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-3.5">
        {primaryStatsWithValues.map((s) => (
          <StatCard key={s.key} stat={s} size="lg" />
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-10">
        {secondaryStatsWithValues.map((s) => (
          <StatCard key={s.key} stat={s} size="sm" />
        ))}
      </div>

      <div className="mb-10">
        <h2 className="text-sm font-semibold mb-3.5">Quick actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickActions.map((a) => {
            const Icon = a.icon;
            return (
              <button
                key={a.key}
                onClick={() => a.page && router.push(`/admin/${a.page}`)}
                style={{ background: '#ffffff', border: '1px solid #e2e8f0' }}
                className="group flex items-start gap-3 p-4 rounded-xl text-left transition hover:shadow-sm hover:-translate-y-0.5"
              >
                <div style={{ background: 'rgba(220, 38, 38, 0.08)', color: '#dc2626' }} className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon size={16} strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium flex items-center gap-1">
                    {a.label}
                    <ArrowRight size={13} className="opacity-0 group-hover:opacity-100 transition -translate-x-1 group-hover:translate-x-0" style={{ color: '#dc2626' }} />
                  </div>
                  <div style={{ color: '#64748b' }} className="text-xs mt-0.5">
                    {a.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-sm font-semibold">Activity</h2>
          <button onClick={() => router.push('/admin/activity')} style={{ color: '#dc2626' }} className="text-xs font-medium flex items-center gap-1">
            View all <ArrowRight size={12} />
          </button>
        </div>
        <div style={{ background: '#ffffff', border: stats.recentActivities.length ? '1px solid #e2e8f0' : '1px dashed #e2e8f0' }} className="rounded-xl overflow-hidden">
          {stats.recentActivities.length === 0 && (
            <div className="py-10 flex flex-col items-center text-center">
              <div style={{ border: '1.5px dashed #e2e8f0' }} className="w-11 h-11 rounded-full flex items-center justify-center mb-3">
                <Activity size={18} style={{ color: '#64748b' }} />
              </div>
              <div className="text-sm font-medium">No recent activity yet</div>
              <p style={{ color: '#64748b' }} className="text-xs mt-1 max-w-xs">
                Actions across users, hospitals, and requests will show up here as they happen.
              </p>
            </div>
          )}
          {stats.recentActivities.map((a, i) => {
            const meta = ACTIVITY_META[a.action as keyof typeof ACTIVITY_META] || ACTIVITY_META.user;
            const Icon = Activity;
            return (
              <div key={a.id} style={{ borderTop: i === 0 ? 'none' : '1px solid #e2e8f0' }} className="flex items-center gap-3.5 px-5 py-3.5">
                <div style={{ background: TONE[meta.tone].bg, color: TONE[meta.tone].fg }} className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                  <Icon size={14} />
                </div>
                <div className="min-w-0 flex-1 text-sm">
                  <span className="font-medium">{a.performedBy}</span> {a.action}
                  {a.entity && <span className="font-medium"> {a.entity}</span>}
                </div>
                <div style={{ color: '#64748b' }} className="text-xs flex-shrink-0">
                  {fmtTime(a.timestamp)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
