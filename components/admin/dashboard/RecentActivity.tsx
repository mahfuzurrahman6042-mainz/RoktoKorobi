import { User, Shield, FileText, MessageSquare, Settings } from 'lucide-react';

interface RecentActivityProps {
  activities: any[];
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

export default function RecentActivity({ activities }: RecentActivityProps) {
  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => {
        const Icon = actionIcons[activity.action] || actionIcons.default;
        const colorClass = actionColors[activity.action] || actionColors.default;

        return (
          <div key={activity.id} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {activity.user_profiles?.full_name || 'Unknown User'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {formatAction(activity.action)}
                {activity.resource_type && (
                  <span className="ml-1">
                    on {activity.resource_type}
                  </span>
                )}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {formatTime(activity.created_at)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
