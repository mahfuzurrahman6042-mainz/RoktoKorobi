'use client';

import { User, Shield, FileText, MessageSquare, Settings, Calendar, Clock } from 'lucide-react';

interface ActivityTableProps {
  activities: any[];
  totalCount: number;
  currentPage: number;
  limit: number;
}

const actionIcons: Record<string, any> = {
  assign_role: Shield,
  revoke_role: Shield,
  create_blog: FileText,
  edit_blog: FileText,
  delete_blog: FileText,
  approve_testimonial: MessageSquare,
  reject_testimonial: MessageSquare,
  delete_testimonial: MessageSquare,
  update_settings: Settings,
  default: User
};

const actionColors: Record<string, string> = {
  assign_role: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  revoke_role: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  create_blog: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  edit_blog: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
  delete_blog: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  approve_testimonial: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  reject_testimonial: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  update_settings: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  default: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
};

function formatAction(action: string): string {
  return action
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatTime(date: string): string {
  const now = new Date();
  const activityDate = new Date(date);
  const diffMs = now.getTime() - activityDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return activityDate.toLocaleDateString();
}

export default function ActivityTable({ activities, totalCount, currentPage, limit }: ActivityTableProps) {
  const totalPages = Math.ceil(totalCount / limit);

  return (
    <>
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              User
            </th>
            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Action
            </th>
            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Resource
            </th>
            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Time
            </th>
            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Date
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {activities.map((activity) => {
            const Icon = actionIcons[activity.action] || actionIcons.default;
            const colorClass = actionColors[activity.action] || actionColors.default;

            return (
              <tr key={activity.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                      <span className="text-red-600 dark:text-red-400 font-semibold text-sm">
                        {activity.user_profiles?.full_name?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {activity.user_profiles?.full_name || 'Unknown User'}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClass}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {formatAction(activity.action)}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {activity.resource_type || 'System'}
                    {activity.resource_id && (
                      <span className="ml-1 text-gray-400 dark:text-gray-500">#{activity.resource_id.slice(0, 8)}</span>
                    )}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    {formatTime(activity.created_at)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    {new Date(activity.created_at).toLocaleDateString()}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, totalCount)} of {totalCount} activities
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const url = new URL(window.location.href);
                url.searchParams.set('page', (currentPage - 1).toString());
                window.location.href = url.toString();
              }}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const pageNum = currentPage <= 3 ? i + 1 : currentPage + i - 2;
              if (pageNum > totalPages) return null;
              return (
                <button
                  key={pageNum}
                  onClick={() => {
                    const url = new URL(window.location.href);
                    url.searchParams.set('page', pageNum.toString());
                    window.location.href = url.toString();
                  }}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg ${
                    pageNum === currentPage
                      ? 'bg-red-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => {
                const url = new URL(window.location.href);
                url.searchParams.set('page', (currentPage + 1).toString());
                window.location.href = url.toString();
              }}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </>
  );
}
