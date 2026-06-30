'use client';

import { useState, useEffect } from 'react';
import { database, ref, get, set } from '@/lib/firebase';
import { Activity, Search, Filter, User, Settings, Shield, Trash2, FileText, Building2, Heart, MessageSquare } from 'lucide-react';

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

export default function ActivityPage() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');

  const actionTypes = ['all', 'user_created', 'user_updated', 'user_deleted', 'user_banned', 'role_assigned', 'hospital_added', 'hospital_updated', 'hospital_deleted', 'blog_created', 'blog_updated', 'blog_deleted', 'testimonial_added', 'testimonial_verified', 'testimonial_deleted', 'request_fulfilled', 'request_deleted'];

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

  const getActionIcon = (action: string) => {
    if (action.includes('user')) return User;
    if (action.includes('role')) return Shield;
    if (action.includes('hospital')) return Building2;
    if (action.includes('blog')) return FileText;
    if (action.includes('testimonial')) return MessageSquare;
    if (action.includes('request')) return Heart;
    return Activity;
  };

  const getActionColor = (action: string) => {
    if (action.includes('deleted') || action.includes('banned')) return 'text-red-600 bg-red-100';
    if (action.includes('created') || action.includes('added')) return 'text-green-600 bg-green-100';
    if (action.includes('updated')) return 'text-blue-600 bg-blue-100';
    if (action.includes('verified') || action.includes('fulfilled')) return 'text-purple-600 bg-purple-100';
    return 'text-gray-600 bg-gray-100';
  };

  const formatAction = (action: string) => {
    return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = 
      activity.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.performedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.details.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = 
      filterAction === 'all' || activity.action === filterAction;
    
    return matchesSearch && matchesAction;
  });

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
        <h1 className="text-3xl font-bold text-gray-900">Activity Logs</h1>
        <p className="text-gray-600 mt-2">
          Track all admin actions and system events.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by action, entity, or user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All Actions</option>
            {actionTypes.filter(a => a !== 'all').map(action => (
              <option key={action} value={action}>{formatAction(action)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-gray-500 text-sm">Total Activities</p>
          <p className="text-3xl font-bold text-gray-900">{activities.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-gray-500 text-sm">Today</p>
          <p className="text-3xl font-bold text-blue-600">{activities.filter(a => new Date(a.timestamp).toDateString() === new Date().toDateString()).length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-gray-500 text-sm">This Week</p>
          <p className="text-3xl font-bold text-green-600">{activities.filter(a => {
            const date = new Date(a.timestamp);
            const now = new Date();
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return date >= weekAgo;
          }).length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-gray-500 text-sm">This Month</p>
          <p className="text-3xl font-bold text-purple-600">{activities.filter(a => {
            const date = new Date(a.timestamp);
            const now = new Date();
            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
          }).length}</p>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="divide-y divide-gray-200">
          {filteredActivities.map((activity, index) => {
            const Icon = getActionIcon(activity.action);
            const colorClass = getActionColor(activity.action);
            
            return (
              <div key={activity.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                    <Icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-gray-900">{formatAction(activity.action)}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">{activity.performedBy}</span> ({activity.performedByEmail})
                    </p>
                    <p className="text-sm text-gray-700">
                      {activity.details}
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                      <span className="px-2 py-1 bg-gray-100 rounded">{activity.entity}</span>
                      <span>ID: {activity.entityId}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {filteredActivities.length === 0 && (
          <div className="text-center py-12">
            <Activity size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No activity logs found</p>
          </div>
        )}
      </div>
    </div>
  );
}
