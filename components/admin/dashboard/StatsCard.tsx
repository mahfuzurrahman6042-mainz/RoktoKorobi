import { Users, FileText, MessageSquare, Clock } from 'lucide-react';

interface StatsCardProps {
  stat: {
    name: string;
    value: number;
    change: string;
    changeType: 'positive' | 'negative';
    icon: string;
  };
}

const icons = {
  users: Users,
  file: FileText,
  message: MessageSquare,
  clock: Clock
};

export default function StatsCard({ stat }: StatsCardProps) {
  const Icon = icons[stat.icon as keyof typeof icons] || Users;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
          <Icon className="w-6 h-6 text-red-600 dark:text-red-400" />
        </div>
        <span className={`text-sm font-medium ${
          stat.changeType === 'positive' 
            ? 'text-green-600 dark:text-green-400' 
            : 'text-red-600 dark:text-red-400'
        }`}>
          {stat.change}
        </span>
      </div>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
        {stat.value.toLocaleString()}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {stat.name}
      </p>
    </div>
  );
}
