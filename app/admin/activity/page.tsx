'use client';

import { useState, useEffect, useMemo } from 'react';
import { database, ref, get } from '@/lib/firebase';
import { Search, Filter, Calendar, ChevronDown, Activity } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ActivityLog {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  performedBy: string;
  performedByEmail: string;
  details: string;
  timestamp: string;
}

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

const TONE = {
  crimson: { bg: 'var(--crimson-tint)', fg: 'var(--crimson)' },
  navy: { bg: 'var(--navy-tint)', fg: 'var(--navy)' },
  amber: { bg: 'var(--amber-tint)', fg: 'var(--amber)' },
  green: { bg: 'var(--green-tint)', fg: 'var(--green)' },
  ink: { bg: '#EEF0F1', fg: 'var(--ink)' },
};

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function fmtTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

function PageHeader({ title, subtitle, onBack }: { title: string; subtitle?: string; onBack?: () => void }) {
  return (
    <div className="flex items-start gap-3 mb-7">
      {onBack && (
        <button
          onClick={onBack}
          style={{ border: '1px solid var(--line)', background: 'var(--surface)' }}
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
        >
          ←
        </button>
      )}
      <div>
        <h1 style={{ fontFamily: "'IBM Plex Serif', serif" }} className="text-2xl font-semibold leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p style={{ color: 'var(--ink-muted)' }} className="text-sm mt-1.5">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

export default function ActivityPage() {
  const router = useRouter();
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      if (!database) return;

      const activityRef = ref(database, 'activityLogs');
      const snapshot = await get(activityRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        const activitiesArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setActivities(activitiesArray);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return activities
      .filter((a) => {
        const q = search.trim().toLowerCase();
        const hay = `${a.performedBy} ${a.action} ${a.entity} ${a.details}`.toLowerCase();
        const matchesSearch = !q || hay.includes(q);
        const matchesType = type === 'all' || a.action.includes(type);
        const d = new Date(a.timestamp);
        const matchesFrom = !from || d >= new Date(from + 'T00:00:00');
        const matchesTo = !to || d <= new Date(to + 'T23:59:59');
        return matchesSearch && matchesType && matchesFrom && matchesTo;
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [activities, search, type, from, to]);

  let lastDay: string | null = null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--crimson)' }}></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Activity"
        subtitle="Everything that happens across Roktokorobi, in one place."
        onBack={() => router.push('/admin')}
      />

      <div style={{ background: 'var(--surface)', border: '1px solid var(--line)' }} className="rounded-xl p-4 mb-5 flex flex-wrap items-center gap-3">
        <div
          style={{ background: 'var(--canvas)', border: '1px solid var(--line)' }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg flex-1 min-w-[200px]"
        >
          <Search size={15} style={{ color: 'var(--ink-muted)' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search activity…"
            className="bg-transparent outline-none text-sm w-full"
          />
        </div>

        <div className="relative">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            style={{ border: '1px solid var(--line)' }}
            className="appearance-none pl-8 pr-8 py-2 rounded-lg text-sm bg-white"
          >
            <option value="all">All types</option>
            {Object.entries(ACTIVITY_META).map(([key, meta]) => (
              <option key={key} value={key}>
                {meta.label}
              </option>
            ))}
          </select>
          <Filter size={13} className="absolute left-3 top-3 pointer-events-none" style={{ color: 'var(--ink-muted)' }} />
          <ChevronDown size={13} className="absolute right-2.5 top-3 pointer-events-none" style={{ color: 'var(--ink-muted)' }} />
        </div>

        <div className="flex items-center gap-2">
          <Calendar size={14} style={{ color: 'var(--ink-muted)' }} />
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            style={{ border: '1px solid var(--line)' }}
            className="px-2.5 py-2 rounded-lg text-xs"
          />
          <span style={{ color: 'var(--ink-muted)' }} className="text-xs">
            to
          </span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            style={{ border: '1px solid var(--line)' }}
            className="px-2.5 py-2 rounded-lg text-xs"
          />
        </div>

        {(search || type !== 'all' || from || to) && (
          <button
            onClick={() => {
              setSearch('');
              setType('all');
              setFrom('');
              setTo('');
            }}
            style={{ color: 'var(--ink-muted)' }}
            className="text-xs underline"
          >
            Clear filters
          </button>
        )}
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--line)' }} className="rounded-xl overflow-hidden">
        {filtered.length === 0 && (
          <div className="p-10 flex flex-col items-center text-center">
            <div style={{ border: '1.5px dashed var(--line)' }} className="w-11 h-11 rounded-full flex items-center justify-center mb-3">
              <Activity size={18} style={{ color: 'var(--ink-muted)' }} />
            </div>
            <div className="text-sm font-medium">
              {activities.length === 0 ? 'No activity yet' : 'No activity matches these filters'}
            </div>
            <p style={{ color: 'var(--ink-muted)' }} className="text-xs mt-1 max-w-xs">
              {activities.length === 0
                ? 'Actions across users, hospitals, blogs, Chitrokothon posts, and requests will show up here as they happen.'
                : 'Try adjusting your search, type, or date range.'}
            </p>
          </div>
        )}
        {filtered.map((a, i) => {
          const meta = ACTIVITY_META[a.action as keyof typeof ACTIVITY_META] || ACTIVITY_META.user;
          const day = fmtDate(a.timestamp);
          const showDay = day !== lastDay;
          lastDay = day;
          return (
            <div key={a.id}>
              {showDay && (
                <div
                  style={{
                    background: 'var(--canvas)',
                    borderTop: i === 0 ? 'none' : '1px solid var(--line)',
                    color: 'var(--ink-muted)',
                  }}
                  className="px-5 py-2 text-[11px] uppercase tracking-wide"
                >
                  {day}
                </div>
              )}
              <div style={{ borderTop: showDay ? 'none' : '1px solid var(--line)' }} className="flex items-center gap-3.5 px-5 py-3.5">
                <div style={{ background: TONE[meta.tone].bg, color: TONE[meta.tone].fg }} className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                  <Activity size={14} />
                </div>
                <div className="min-w-0 flex-1 text-sm">
                  <span className="font-medium">{a.performedBy}</span> {a.action}
                  {a.entity && <span className="font-medium"> {a.entity}</span>}
                </div>
                <div style={{ color: 'var(--ink-muted)' }} className="text-xs flex-shrink-0">
                  {fmtTime(a.timestamp)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
