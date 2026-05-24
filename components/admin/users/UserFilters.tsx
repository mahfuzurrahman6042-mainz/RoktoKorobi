'use client';

import { Search, Filter } from 'lucide-react';

interface UserFiltersProps {
  currentSearch?: string;
  currentRole?: string;
  currentStatus?: string;
  roles: Array<{ id: string; name: string; description: string }>;
}

export default function UserFilters({ 
  currentSearch, 
  currentRole, 
  currentStatus,
  roles 
}: UserFiltersProps) {
  const updateUrl = (params: Record<string, string>) => {
    const url = new URL(window.location.href);
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        url.searchParams.set(key, value);
      } else {
        url.searchParams.delete(key);
      }
    });
    window.location.href = url.toString();
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Search */}
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name or email..."
          defaultValue={currentSearch}
          onChange={(e) => updateUrl({ search: e.target.value })}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
        />
      </div>

      {/* Role Filter */}
      <div className="relative">
        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <select
          defaultValue={currentRole}
          onChange={(e) => updateUrl({ role: e.target.value })}
          className="pl-10 pr-8 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none cursor-pointer"
        >
          <option value="">All Roles</option>
          {roles.map((role) => (
            <option key={role.id} value={role.name}>
              {role.name}
            </option>
          ))}
        </select>
      </div>

      {/* Status Filter */}
      <select
        defaultValue={currentStatus}
        onChange={(e) => updateUrl({ status: e.target.value })}
        className="px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none cursor-pointer"
      >
        <option value="">All Status</option>
        <option value="active">Active</option>
        <option value="suspended">Suspended</option>
      </select>
    </div>
  );
}
